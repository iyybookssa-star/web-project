const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { protect, admin } = require('../middleware/auth');
const { cacheMiddleware, invalidateCache } = require('../config/cache');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Multer config for product image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
        cb(ok ? null : new Error('Only image files are allowed'), ok);
    },
});

// All routes require auth + admin
router.use(protect, admin);

// ── Dashboard Stats ────────────────────────────────────────────────────────
router.get('/stats', cacheMiddleware('admin-stats', 120), async (req, res) => {
  try {
    const [productCount, orderCount, userCount, orders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.find({ status: 'Delivered' }).select('totalPrice'),
    ]);
    const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');
    res.json({ productCount, orderCount, userCount, revenue, recentOrders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/reset-revenue
router.post('/reset-revenue', async (req, res) => {
  try {
    await Order.updateMany(
      { status: 'Delivered' },
      { $set: { status: 'Pending', isDelivered: false, deliveredAt: null } }
    );
    invalidateCache('admin-stats');
    res.json({ message: 'Revenue cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Products ───────────────────────────────────────────────────────────────
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    invalidateCache('products');
    invalidateCache('admin-stats');
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    invalidateCache('products');
    invalidateCache('product');
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    invalidateCache('products');
    invalidateCache('product');
    invalidateCache('admin-stats');
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/upload — Upload a product image file
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// ── Orders ─────────────────────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'Delivered' ? { isDelivered: true, deliveredAt: Date.now() } : {}) },
      { new: true }
    ).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    invalidateCache('admin-stats');
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── Users ──────────────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/users/:id/toggle-admin', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    // Prevent self-delete
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
