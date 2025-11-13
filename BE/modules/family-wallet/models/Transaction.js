const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let TransactionModel = null;

const getTransactionModel = async () => {
  if (!TransactionModel) {
    const connection = await getConnection();
    const transactionSchema = new Schema({
      wallet_id: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
      user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      amount: { type: Number, required: true },
      type: { type: String, required: true },
      category: String,
      description: String,
      payment_method: String,
      status: { type: String, default: 'completed' },
      created_at: { type: Date, default: Date.now }
    });
    TransactionModel = connection.model('Transaction', transactionSchema, 'family_wallet_transactions');
  }
  return TransactionModel;
};

module.exports = getTransactionModel;
