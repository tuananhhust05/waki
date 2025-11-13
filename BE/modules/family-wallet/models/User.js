const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let UserModel = null;

const getUserModel = async () => {
  if (!UserModel) {
    const connection = await getConnection();
    const userSchema = new Schema({
      email: { type: String, required: true, unique: true },
      password_hash: { type: String, required: true },
      full_name: { type: String, required: true },
      phone: String,
      role: { type: String, default: 'member' },
      is_active: { type: Boolean, default: true },
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now }
    });
    UserModel = connection.model('User', userSchema, 'family_wallet_users');
  }
  return UserModel;
};

module.exports = getUserModel;
