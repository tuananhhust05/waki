const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let ProductModel = null;

const getProductModel = async () => {
  if (!ProductModel) {
    const connection = await getConnection();
    const productSchema = new Schema({
      user_id: { type: Schema.Types.ObjectId, ref: 'pos_users', required: true },
      name: { type: String, required: true },
      description: String,
      price: { type: Number, required: true },
      cost: Number,
      sku: String,
      category: String,
      stock_quantity: { type: Number, default: 0 },
      is_active: { type: Boolean, default: true },
      created_at: { type: Date, default: Date.now }
    });
    ProductModel = connection.model('Product', productSchema, 'pos_products');
  }
  return ProductModel;
};

module.exports = getProductModel;
