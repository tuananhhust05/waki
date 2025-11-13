const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const getProductModel = require('../models/Product');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const Product = await getProductModel();
    const products = await Product.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, cost, sku, category, stock_quantity } = req.body;
    const Product = await getProductModel();
    const product = new Product({
      user_id: req.user.id,
      name,
      description: description || null,
      price: parseFloat(price),
      cost: cost ? parseFloat(cost) : null,
      sku: sku || null,
      category: category || null,
      stock_quantity: stock_quantity || 0
    });
    await product.save();
    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
