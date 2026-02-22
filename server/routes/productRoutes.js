const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products - Get all products (with optional search & category filter)
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, limit = 20, page = 1 } = req.query;
    const query = {};

    if (category && category !== 'All') query.category = category;
    if (featured === 'true') query.isFeatured = true;

    // Filter by specific IDs (for past purchases, cart, etc.)
    const { ids } = req.query;
    if (ids) {
       const idList = ids.split(',').filter(id => id.match(/^[0-9a-fA-F]{24}$/)); // Basic validation
       if (idList.length > 0) query._id = { $in: idList };
    }

    // Vehicle Fitment Filtering
    const { make, model, year } = req.query;
    if (make) query.compatibleMakes = make;
    if (year) query.compatibleYears = Number(year);
    // Note: Model filtering might need a schema update if we want to be specific, 
    // but for now we'll assume 'make' covers the main compatibility or search description
    if (model && model !== 'Select Model') {
       query.$or = [
          { description: { $regex: model, $options: 'i' } },
          { name: { $regex: model, $options: 'i' } }
       ];
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchOr = [
        { name: searchRegex },
        { partNumber: searchRegex },
        { category: searchRegex },
      ];
      // If we already have an $or from model, we need to combine them with $and
      if (query.$or) {
         query.$and = [{ $or: query.$or }, { $or: searchOr }];
         delete query.$or;
      } else {
         query.$or = searchOr;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).limit(Number(limit)).skip(skip).sort({ createdAt: -1 });

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products - Create product (admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
