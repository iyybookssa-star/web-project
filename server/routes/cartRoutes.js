const express = require('express');
const router = express.Router();

// GET /api/cart - Get cart from session
router.get('/', (req, res) => {
  res.json(req.session.cart || []);
});

// POST /api/cart - Add item to session cart
router.post('/', (req, res) => {
  const { _id, name, partNumber, price, image, qty = 1 } = req.body;

  if (!_id || !name || !price) {
    return res.status(400).json({ message: 'Missing required product fields' });
  }

  if (!req.session.cart) {
    req.session.cart = [];
  }

  const existing = req.session.cart.find((item) => item._id === _id);
  if (existing) {
    existing.qty += qty;
  } else {
    req.session.cart.push({ _id, name, partNumber, price, image, qty });
  }

  // Explicitly save before responding to prevent race conditions
  req.session.save((err) => {
    if (err) console.error('Session save error:', err);
    res.json(req.session.cart);
  });
});

// PUT /api/cart/:id - Update quantity of an item
router.put('/:id', (req, res) => {
  const { qty } = req.body;

  if (!req.session.cart) {
    return res.status(404).json({ message: 'Cart is empty' });
  }

  if (qty <= 0) {
    req.session.cart = req.session.cart.filter((item) => item._id !== req.params.id);
  } else {
    const item = req.session.cart.find((item) => item._id === req.params.id);
    if (item) {
      item.qty = qty;
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
  }

  req.session.save((err) => {
    if (err) console.error('Session save error:', err);
    res.json(req.session.cart);
  });
});

// DELETE /api/cart/:id - Remove item from session cart
router.delete('/:id', (req, res) => {
  if (!req.session.cart) {
    return res.status(404).json({ message: 'Cart is empty' });
  }

  req.session.cart = req.session.cart.filter((item) => item._id !== req.params.id);
  req.session.save((err) => {
    if (err) console.error('Session save error:', err);
    res.json(req.session.cart);
  });
});

// DELETE /api/cart - Clear entire cart
router.delete('/', (req, res) => {
  req.session.cart = [];
  req.session.save((err) => {
    if (err) console.error('Session save error:', err);
    res.json([]);
  });
});

module.exports = router;

