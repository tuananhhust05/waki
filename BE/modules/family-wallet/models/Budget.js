const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let BudgetModel = null;

const getBudgetModel = async () => {
  if (!BudgetModel) {
    const connection = await getConnection();
    const budgetSchema = new Schema({
      family_id: { type: Schema.Types.ObjectId, ref: 'Family', required: true },
      user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      amount: { type: Number, required: true },
      period: { type: String, required: true },
      start_date: { type: Date, required: true },
      end_date: Date,
      is_active: { type: Boolean, default: true },
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now }
    });
    BudgetModel = connection.model('Budget', budgetSchema, 'family_wallet_budgets');
  }
  return BudgetModel;
};

module.exports = getBudgetModel;
