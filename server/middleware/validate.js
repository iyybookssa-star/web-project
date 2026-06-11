const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateObjectId = (id) => {
  return typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/);
};

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Name is required and must be a non-empty string');
  }
  if (!email || typeof email !== 'string' || !validateEmail(email)) {
    errors.push('A valid email address is required');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !validateEmail(email)) {
    errors.push('A valid email address is required');
  }
  if (!password || typeof password !== 'string' || password.trim() === '') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
};

const validateProduct = (req, res, next) => {
  const { name, partNumber, category, price, image, stock } = req.body;
  const errors = [];
  const validCategories = [
    'Engines', 'Brakes', 'Lighting', 'Suspension', 'Filters', 
    'Exhaust', 'Transmission', 'Electrical', 'Body', 'Accessories'
  ];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Product name is required and must be a non-empty string');
  }
  if (!partNumber || typeof partNumber !== 'string' || partNumber.trim() === '') {
    errors.push('Part number is required and must be a non-empty string');
  }
  if (!category || !validCategories.includes(category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}`);
  }
  if (price === undefined || typeof price !== 'number' || price < 0) {
    errors.push('Price must be a non-negative number');
  }
  if (!image || typeof image !== 'string' || image.trim() === '') {
    errors.push('Product image URL/path is required');
  }
  if (stock === undefined || typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
    errors.push('Stock must be a non-negative integer');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
};

const validateOrder = (req, res, next) => {
  const { 
    items, 
    shippingAddress, 
    paymentMethod, 
    itemsPrice, 
    shippingPrice, 
    taxPrice, 
    totalPrice 
  } = req.body;
  const errors = [];

  // Validate items list
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    items.forEach((item, index) => {
      if (!item.product || !validateObjectId(item.product)) {
        errors.push(`Item at index ${index} has an invalid or missing product ID`);
      }
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        errors.push(`Item at index ${index} must have a name`);
      }
      if (!item.image || typeof item.image !== 'string' || item.image.trim() === '') {
        errors.push(`Item at index ${index} must have an image`);
      }
      if (item.price === undefined || typeof item.price !== 'number' || item.price < 0) {
        errors.push(`Item at index ${index} must have a non-negative price`);
      }
      if (item.qty === undefined || typeof item.qty !== 'number' || item.qty < 1 || !Number.isInteger(item.qty)) {
        errors.push(`Item at index ${index} must have a positive integer quantity (minimum 1)`);
      }
    });
  }

  // Validate shipping address
  if (!shippingAddress || typeof shippingAddress !== 'object') {
    errors.push('Shipping address is required');
  } else {
    const { street, city, state, zip } = shippingAddress;
    if (!street || typeof street !== 'string' || street.trim() === '') errors.push('Street address is required');
    if (!city || typeof city !== 'string' || city.trim() === '') errors.push('City is required');
    if (!state || typeof state !== 'string' || state.trim() === '') errors.push('State is required');
    if (!zip || typeof zip !== 'string' || zip.trim() === '') errors.push('Zip code is required');
  }

  // Validate payment method
  if (!paymentMethod || typeof paymentMethod !== 'string' || paymentMethod.trim() === '') {
    errors.push('Payment method is required');
  }

  // Validate prices
  const priceFields = { itemsPrice, shippingPrice, taxPrice, totalPrice };
  Object.keys(priceFields).forEach((field) => {
    const val = priceFields[field];
    if (val === undefined || typeof val !== 'number' || val < 0) {
      errors.push(`${field.replace(/Price$/, ' Price')} must be a non-negative number`);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateOrder,
};
