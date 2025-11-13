const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let SchoolModel = null;

const getSchoolModel = async () => {
  if (!SchoolModel) {
    const connection = await getConnection();
    const schoolSchema = new Schema({
      name: { type: String, required: true },
      address: String,
      phone: String,
      admin_id: { type: Schema.Types.ObjectId, ref: 'User' },
      created_at: { type: Date, default: Date.now }
    });
    SchoolModel = connection.model('School', schoolSchema, 'school_schools');
  }
  return SchoolModel;
};

module.exports = getSchoolModel;
