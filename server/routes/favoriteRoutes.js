const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
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
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    // Use .some() with .toString() so ObjectId vs String comparison works
    const alreadyFavorited = user.favorites.some(
      (id) => id.toString() === productId,
    );

    if (alreadyFavorited) {
      // Remove using $pull (atomic, skips pre-save hooks)
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { favorites: productId },
      });
      const updated = await User.findById(req.user._id);
      return res.json({ isFavorite: false, favorites: updated.favorites });
    } else {
      // Add using $addToSet (atomic, prevents duplicates)
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { favorites: productId },
      });
      const updated = await User.findById(req.user._id);
      return res.json({ isFavorite: true, favorites: updated.favorites });
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
    const isFavorite = user.favorites.some(
      (id) => id.toString() === req.params.productId,
    );
    res.json({ isFavorite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
