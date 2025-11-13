const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let SaleModel = null;

const getSaleModel = async () => {
  if (!SaleModel) {
    const connection = await getConnection();
    const saleSchema = new Schema({
      user_id: { type: Schema.Types.ObjectId, ref: 'pos_users', required: true },
      sale_number: { type: String, required: true, unique: true },
      total_amount: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      payment_method: { type: String, required: true },
      payment_status: { type: String, default: 'completed' },
      created_at: { type: Date, default: Date.now }
    });
    SaleModel = connection.model('Sale', saleSchema, 'pos_sales');
  }
  return SaleModel;
};

module.exports = getSaleModel;
