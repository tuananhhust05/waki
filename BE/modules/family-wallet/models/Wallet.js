const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let WalletModel = null;

const getWalletModel = async () => {
  if (!WalletModel) {
    const connection = await getConnection();
    const walletSchema = new Schema({
      user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      family_id: { type: Schema.Types.ObjectId, ref: 'Family', required: true },
      balance: { type: Number, default: 0.00 },
      currency: { type: String, default: 'SAR' },
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now }
    });
    WalletModel = connection.model('Wallet', walletSchema, 'family_wallet_wallets');
  }
  return WalletModel;
};

module.exports = getWalletModel;
