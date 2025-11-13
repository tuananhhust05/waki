const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let TransactionModel = null;

const getTransactionModel = async () => {
  if (!TransactionModel) {
    const connection = await getConnection();
    const transactionSchema = new Schema({
      user_id: { type: Schema.Types.ObjectId, ref: 'ai_users', required: true },
      amount: { type: Number, required: true },
      transaction_type: { type: String, required: true },
      category: String,
      description: String,
      is_anomaly: { type: Boolean, default: false },
      anomaly_score: Number,
      created_at: { type: Date, default: Date.now }
    });
    TransactionModel = connection.model('Transaction', transactionSchema, 'ai_transactions');
  }
  return TransactionModel;
};

module.exports = getTransactionModel;
