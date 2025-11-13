const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let FamilyModel = null;

const getFamilyModel = async () => {
  if (!FamilyModel) {
    const connection = await getConnection();
    const familySchema = new Schema({
      name: { type: String, required: true },
      parent_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now }
    });
    FamilyModel = connection.model('Family', familySchema, 'family_wallet_families');
  }
  return FamilyModel;
};

module.exports = getFamilyModel;
