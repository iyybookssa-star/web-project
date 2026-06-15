const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const { cacheMiddleware, invalidateCache } = require('../config/cache');
const { validateProduct } = require('../middleware/validate');

const router = express.Router();

// Helper to escape characters for regex search to prevent Regex Injection / ReDoS
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// GET /api/products - Get all products (with optional search & category filter)
router.get('/', cacheMiddleware('products'), async (req, res) => {
  try {
    const { category, search, featured, limit = 20, page = 1 } = req.query;
    const query = {};

    // Validate parameter types to prevent object injection/tampering
    const categoryStr = typeof category === 'string' ? category : undefined;
    const searchStr = typeof search === 'string' ? search : undefined;
    const featuredStr = typeof featured === 'string' ? featured : undefined;
    
    if (categoryStr && categoryStr !== 'All') query.category = categoryStr;
    if (featuredStr === 'true') query.isFeatured = true;

    // Filter by specific IDs (for past purchases, cart, etc.)
    const { ids } = req.query;
    const idsStr = typeof ids === 'string' ? ids : undefined;
    if (idsStr) {
       const idList = idsStr.split(',').filter(id => id.match(/^[0-9a-fA-F]{24}$/)); // Basic validation
       if (idList.length > 0) query._id = { $in: idList };
    }

    // Vehicle Fitment Filtering
    const { make, model, year } = req.query;
    const makeStr = typeof make === 'string' ? make : undefined;
    const modelStr = typeof model === 'string' ? model : undefined;
    const yearStr = typeof year === 'string' ? year : undefined;

    if (makeStr) query.compatibleMakes = makeStr;
    if (yearStr) {
       const parsedYear = Number(yearStr);
       if (!isNaN(parsedYear)) query.compatibleYears = parsedYear;
    }

    // Escape regex pattern inputs to prevent regex execution errors or Denial of Service (ReDoS)
    if (modelStr && modelStr !== 'Select Model') {
       const escapedModel = escapeRegExp(modelStr);
       query.$or = [
          { description: { $regex: escapedModel, $options: 'i' } },
          { name: { $regex: escapedModel, $options: 'i' } }
       ];
    }

    if (searchStr) {
      const escapedSearch = escapeRegExp(searchStr);
      const searchRegex = { $regex: escapedSearch, $options: 'i' };
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

    // Secure pagination bounds to prevent excessive database load
    const cleanLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const cleanPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (cleanPage - 1) * cleanLimit;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query).limit(cleanLimit).skip(skip).sort({ createdAt: -1 }).lean();

    res.json({ products, total, page: cleanPage, pages: Math.ceil(total / cleanLimit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', cacheMiddleware('product'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products - Create product (admin only)
router.post('/', protect, admin, validateProduct, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    invalidateCache('products');
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', protect, admin, validateProduct, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    invalidateCache('products');
    invalidateCache('product');
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
    invalidateCache('products');
    invalidateCache('product');
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
