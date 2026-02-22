const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Order = require('../models/Order');

dotenv.config({ path: path.join(__dirname, '../.env') });

const resetRevenue = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Connected to MongoDB...');

    const result = await Order.updateMany(
      { status: 'Delivered' },
      { $set: { status: 'Pending', isDelivered: false, deliveredAt: null } }
    );

    console.log(`✅ Reset ${result.modifiedCount} orders from 'Delivered' to 'Pending'.`);
    console.log('📉 Revenue should now be $0.00');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetRevenue();
