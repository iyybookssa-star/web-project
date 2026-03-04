const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// @route   GET /api/favorites
// @desc    Get current user's favorited products (populated)
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    res.json(user.favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/favorites/:productId
// @desc    Toggle a product as favorite
// @access  Private
router.post("/:productId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const index = user.favorites.indexOf(productId);

    if (index > -1) {
      // Already favorited → remove
      user.favorites.splice(index, 1);
      await user.save();
      res.json({ isFavorite: false, favorites: user.favorites });
    } else {
      // Not favorited → add
      user.favorites.push(productId);
      await user.save();
      res.json({ isFavorite: true, favorites: user.favorites });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/favorites/check/:productId
// @desc    Check if a specific product is favorited
// @access  Private
router.get("/check/:productId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isFavorite = user.favorites.includes(req.params.productId);
    res.json({ isFavorite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
