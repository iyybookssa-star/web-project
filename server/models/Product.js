const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    partNumber: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
      enum: ['Engines', 'Brakes', 'Lighting', 'Suspension', 'Filters', 'Exhaust', 'Transmission', 'Electrical', 'Body', 'Accessories'],
    },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: null },
    description: { type: String, required: true },
    image: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    compatibleMakes: [{ type: String }],
    compatibleYears: [{ type: Number }],
    isFeatured: { type: Boolean, default: false },
    badge: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
