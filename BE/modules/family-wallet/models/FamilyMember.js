const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let FamilyMemberModel = null;

const getFamilyMemberModel = async () => {
  if (!FamilyMemberModel) {
    const connection = await getConnection();
    const familyMemberSchema = new Schema({
      family_id: { type: Schema.Types.ObjectId, ref: 'Family', required: true },
      user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      relationship: String,
      created_at: { type: Date, default: Date.now }
    });
    familyMemberSchema.index({ family_id: 1, user_id: 1 }, { unique: true });
    FamilyMemberModel = connection.model('FamilyMember', familyMemberSchema, 'family_wallet_family_members');
  }
  return FamilyMemberModel;
};

module.exports = getFamilyMemberModel;
