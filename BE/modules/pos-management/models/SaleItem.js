const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let SaleItemModel = null;

const getSaleItemModel = async () => {
  if (!SaleItemModel) {
    const connection = await getConnection();
    const saleItemSchema = new Schema({
      sale_id: { type: Schema.Types.ObjectId, ref: 'pos_sales', required: true },
      product_id: { type: Schema.Types.ObjectId, ref: 'pos_products', required: true },
      quantity: { type: Number, required: true },
      unit_price: { type: Number, required: true },
      total_price: { type: Number, required: true },
      created_at: { type: Date, default: Date.now }
    });
    SaleItemModel = connection.model('SaleItem', saleItemSchema, 'pos_sale_items');
  }
  return SaleItemModel;
};

module.exports = getSaleItemModel;
