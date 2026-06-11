const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { invalidateCache } = require('../config/cache');
const { validateOrder } = require('../middleware/validate');

const router = express.Router();

// POST /api/orders - Create a new order (protected)
router.post('/', protect, validateOrder, async (req, res) => {
  const { items, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    // Validate stock availability before creating order
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}. Only ${product.stock} left.` });
      }
    }

    // Create the order
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });

    // Deduct stock from each product immediately upon order creation
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty },
      });
    }

    // Invalidate caches — stock changed and order count increased
    invalidateCache('admin-stats');
    invalidateCache('products');
    invalidateCache('product');

    // Also store in session so it clears when browser closes
    if (!req.session.orders) req.session.orders = [];
    req.session.orders.unshift(order.toObject());

    // Explicitly save session to ensure it persists
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.status(201).json(order);
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/orders/myorders - Get orders from session (clears when browser closes)
router.get('/myorders', protect, async (req, res) => {
  try {
    // If session has no orders yet, load from DB (first visit in this session)
    if (!req.session.orders) {
      const dbOrders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
      req.session.orders = dbOrders.map(o => o.toObject());
      req.session.save();
    }
    res.json(req.session.orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id - Get single order (protected)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Make sure only the owner can view
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

