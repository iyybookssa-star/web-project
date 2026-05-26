const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const products = [
  {
    name: 'Elite Ceramic Brake Pads - Set of 4',
    partNumber: 'BP-4492-X',
    category: 'Brakes',
    price: 89.99,
    originalPrice: 114.99,
    description: 'Professional-grade ceramic brake pads offering superior stopping power and reduced brake dust. Compatible with most front disc brake systems. Features 500°F working temperature and includes hardware kit.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_wgl5pf6tbbuP0bCBA060xpodY2vZDVbElWicpVfzSHQDUT1kb4WDiHfiqKoH0OiYzci3DEhk6CBgqIVbc-kdi2sFdEK9LohF4fNl8kT15TdmANAqyFkkLEPj3bi9RaGsCI-rrFNpIfptIvxh7BTViQy6rRg5tKDne3FDklt67Z-YicxY1Dm0d92u41-y6H4Gos_VRJy-8VfvKbrLldDSY3BkAFkKJ3WtYAh8L0P_I_BZyJoyn9JOuqWQOoGvh2mo68LhQd4Tjys_',
    stock: 45,
    rating: 4.9,
    numReviews: 120,
    compatibleMakes: ['Toyota', 'Honda', 'Ford', 'Chevrolet'],
    compatibleYears: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    isFeatured: true,
    badge: 'HOT DEAL',
  },
  {
    name: 'LED Headlight Conversion Kit (H11)',
    partNumber: 'LT-9920-LED',
    category: 'Lighting',
    price: 124.50,
    originalPrice: null,
    description: 'Ultra-bright 6000K white LED headlight conversion kit. 300% brighter than stock halogen bulbs. Plug-and-play installation, IP67 waterproof rated, 50,000 hour lifespan.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtYB9i0S4wSNPS-XjAaoyMLbTd1nr75-XoNrek5x8hQlSKdJszU1RuPOBR4J4FQqllagwSJdmpxopI6mVQgh_lXwrXXmMRvhTRWz7ZGxUa-LkATreIGmq13bvgY2ykSj4ZV9YLRm-ELrGkMFtnYoX-NwuHmFWiMTvDV4BsOk87QLIGBeSxDvXV-gDYBW5AMqeAceso9J7VjjyhEvnBNzvckBFA4DLm78N1T0af252SSOGD_pIEkuowsMF6o6ntcsQmBWt1EooB4Xm1',
    stock: 28,
    rating: 4.7,
    numReviews: 89,
    compatibleMakes: ['Toyota', 'Honda', 'BMW', 'Audi'],
    compatibleYears: [2016, 2017, 2018, 2019, 2020, 2021, 2022],
    isFeatured: true,
    badge: null,
  },
  {
    name: 'Precision Fuel Injector - Performance Series',
    partNumber: 'FI-1120-P',
    category: 'Engines',
    price: 54.99,
    originalPrice: null,
    description: 'High-performance fuel injector with precision atomization for maximum combustion efficiency. Direct OEM replacement, improves fuel economy by up to 15%. Includes all mounting hardware.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYbN6yfAahTTjxooCUlMdi2MgEo4yrp4HP1IYkBfFId7D2Ns9x2XT-XaxwLwllcsDebgPLwh4jzX1rkeNTdAKoTTA6pzDpGmleER2v0c7dq81L2mlTPqP8tSP0Wqa1X0W6whdxcZ39M4vT5f2ThuF1kNqcjbpexvd-hgIK2mmXURj_2Wjebv1jLXkYnrMiF-5RTXvs19G2qs8HXcsmzbuBTaoeBUnWnk3NUOFXRkwrz0ZNh-YifGDIT8dRd8zP7vvV0arcjiMvxj7j',
    stock: 60,
    rating: 4.8,
    numReviews: 56,
    compatibleMakes: ['Ford', 'Chevrolet', 'GMC', 'Dodge'],
    compatibleYears: [2014, 2015, 2016, 2017, 2018, 2019],
    isFeatured: true,
    badge: null,
  },
  {
    name: 'K&N High-Flow Air Filter - Reusable',
    partNumber: 'AF-KN-120',
    category: 'Filters',
    price: 65.00,
    originalPrice: null,
    description: 'Washable and reusable cotton gauze air filter offering superior airflow over stock paper filters. Increases horsepower and torque. Guaranteed to outlast the life of your vehicle.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCsk-LDHu273FV5A4yNXOT0KzSY8YHV3-dpapFdG29UojnUayfWYip4AfFL3KQJbXAkX5b1rD_U87IkLf7ZiCJwUjaY9bTzADUVA2uCoZKj6Njr-0v0lNH583q8GuplhJXY7HOWkse_GZfreFtaF2STQF_yW-Fwx6jDPygMjXtz6TUJvxHLqaPwsvCeOyJOdhQUPcb1Ot1-URahVHAQHCSkdT_w8SFaG5ED__2ie4nA5RzDOcEzY5GVSGX5Zxh0DNahSLpSimWTYiS',
    stock: 100,
    rating: 5.0,
    numReviews: 200,
    compatibleMakes: ['Toyota', 'Honda', 'Nissan', 'Subaru'],
    compatibleYears: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
    isFeatured: true,
    badge: 'IN STOCK',
  },
  {
    name: 'Performance Coilover Suspension Kit',
    partNumber: 'SUS-CC-8800',
    category: 'Suspension',
    price: 349.99,
    originalPrice: 420.00,
    description: 'Full coilover suspension kit with 32-way adjustable damping. Lowers ride height by 1-3 inches. Ideal for street and track use. Includes camber plates and locking collars.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWGKo5wxUhlbFpBNZv8RcNscbN4s15jc-prwUN8ZEXOdydBZvYCd866egQ-ZRiimPVp_neFOqfRgmNTMQX70PXd3WIrpewldTBkN4qjjhU0rnC9Db-8oczq1qcIQP_2M5aLff3BchJUVpqcE0i2l4F-Rd7iVNz0NfvCOuq9AN5pzBkCBvO-xwIlUh4dlO3_Vw_7A3k9qWCGoE6CQPbh0Z9fqWfZIjb8jVYJiUMZ6Q356oBbzk0QUK7YpHHXeBAG03QJKOZrezBSl5J',
    stock: 12,
    rating: 4.6,
    numReviews: 34,
    compatibleMakes: ['Honda', 'Subaru', 'Mitsubishi', 'Mazda'],
    compatibleYears: [2015, 2016, 2017, 2018, 2019, 2020],
    isFeatured: false,
    badge: 'HOT DEAL',
  },
  {
    name: 'Stainless Steel Exhaust Cat-Back System',
    partNumber: 'EXH-CB-4400',
    category: 'Exhaust',
    price: 289.00,
    originalPrice: 340.00,
    description: 'Mandrel-bent T304 stainless steel cat-back exhaust system. Deep aggressive tone with noticeable power gains. Includes all clamps, hangers, and gaskets for direct bolt-on installation.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA67kmxV4KARGeg5sHr9ZkgdnZIa9vSBfrt30Q3cZ14lhmV878aSj-o6EwE9WXdpIc9OaRpArOX9PmtlxnQy3FzKNDPMZhZfcCSbnTVGCPLP3_C5VrLQU3cktLV4n3hCNPROcGpl7aVgufxYeT1753X7iB4EE7Kct1K9S0eKGYPwyNdzq3JEHXC7baUYSqBTvTlMW9lqdt_3m2kGMaxyUwI7iSKp40CTGHdN8ZvMHvv77KESXjiuUVmKzwcLGByrqHrcsgZvP_ZlY9h',
    stock: 7,
    rating: 4.4,
    numReviews: 22,
    compatibleMakes: ['Ford', 'Mustang', 'Chevrolet', 'Camaro'],
    compatibleYears: [2018, 2019, 2020, 2021, 2022, 2023],
    isFeatured: false,
    badge: null,
  },
  {
    name: 'High-Capacity Racing Radiator',
    partNumber: 'RAD-ALUM-550',
    category: 'Engines',
    price: 178.50,
    originalPrice: 210.00,
    description: 'All-aluminum 2-row racing radiator with 40% more cooling capacity than OEM. Includes mounting brackets, drain plug, and inlet/outlet fittings. Perfect for high-performance and track applications.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbtRcLsd2UAmB7GFTH9C1_9pqa5EPDJ_fedWfGMh-7cVacgcMuU1omTFoUn8nFuG78rP1rx7GOFQefEhZlgvFIftsruAE82bOf3hGrNMHg7iUFeLXcou-AbPcQSSVVuk6OD2Yiq40hRjSSdqD5nL6qcRUCFuelVFdvZuxIF4uue3pGdA6BDmE1kf_H7dhhRpXE-gBNd76LqXO_uBduTiQqyXIXYq4lProyZe56zccsmxv2RJD0rHH2B4FeMWpGKQGAwcwIRGtpdJD8',
    stock: 18,
    rating: 4.7,
    numReviews: 41,
    compatibleMakes: ['Toyota', 'Nissan', 'Honda', 'Mazda'],
    compatibleYears: [2012, 2013, 2014, 2015, 2016, 2017, 2018],
    isFeatured: false,
    badge: null,
  },
  {
    name: 'LED Angel Eye Halo Headlights',
    partNumber: 'LT-AE-BMW-3',
    category: 'Lighting',
    price: 215.00,
    originalPrice: 260.00,
    description: 'Plug-and-play LED DRL angel eye halo headlights to replace your stock halogen units. Exceptional light output, integrated turn signals, and sequential DRL animation. Smoke lens style.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjzMPX8ORnMFjS36eTpCq5qDljOPQAA-S0_7G1V3Xqz_K_QfJARuqwdFZOEhRSpSCDCIKLFb1fM1sNhnkdg70guTMbGijHT3-AXbkTyvcd4BIwpblWgh41K4R0DIzs9ermE82RePqdTfm1DhygRYaRYs533vJokZIE0hBsrts-sOB8FBxQhfChabehKiKoo-2Pck3P7AkBhfHZcRlBWSmg6bwr2TweYcs-ABpnYtvE2NNCfr7DTiXN9JQuHYPhT-tbrLg7xXlCzjis',
    stock: 9,
    rating: 4.5,
    numReviews: 18,
    compatibleMakes: ['BMW'],
    compatibleYears: [2013, 2014, 2015, 2016, 2017, 2018],
    isFeatured: false,
    badge: 'HOT DEAL',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    await Product.deleteMany();
    await User.deleteMany();

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@partify.com',
      password: 'admin123456',
      isAdmin: true,
    });

    // Create regular user
    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      isAdmin: false,
    });

    await Product.insertMany(products);

    console.log('✅ Data Seeded Successfully!');
    console.log('👤 Admin: admin@partify.com / admin123456');
    console.log('👤 User: john@example.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();
