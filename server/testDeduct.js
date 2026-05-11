const axios = require('axios');
const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const prod = await Product.findOne();
    const oldStock = prod.stock;
    console.log('Product:', prod.name, 'Old stock:', oldStock);
    
    // Create an order
    const items = [{
      product: prod._id,
      name: prod.name,
      image: prod.image || 'x',
      price: prod.price,
      qty: 1
    }];
    
    for (const item of items) {
      console.log('Deducting', item.qty, 'from', item.product);
      const res = await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty }
      }, {new: true});
      console.log('findByIdAndUpdate result stock:', res.stock);
    }
    
    const prodAfter = await Product.findById(prod._id);
    console.log('New stock in DB:', prodAfter.stock);
    process.exit(0);
});
