const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const getSaleModel = require('../models/Sale');
const getSaleItemModel = require('../models/SaleItem');
const getProductModel = require('../models/Product');
const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, total_amount, discount, payment_method } = req.body;
    const saleNumber = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const Sale = await getSaleModel();
    const SaleItem = await getSaleItemModel();
    const Product = await getProductModel();

    const sale = new Sale({
      user_id: req.user.id,
      sale_number,
      total_amount: parseFloat(total_amount),
      discount: discount || 0,
      payment_method
    });
    await sale.save();

    for (const item of items) {
      const saleItem = new SaleItem({
        sale_id: sale._id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      });
      await saleItem.save();

      await Product.updateOne(
        { _id: item.product_id },
        { $inc: { stock_quantity: -item.quantity } }
      );
    }

    const saleItems = await SaleItem.find({ sale_id: sale._id })
      .populate('product_id', 'name');

    res.status(201).json({
      sale: {
        ...sale.toObject(),
        items: saleItems
      }
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const Sale = await getSaleModel();
    const sales = await Sale.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    res.json({ sales });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
