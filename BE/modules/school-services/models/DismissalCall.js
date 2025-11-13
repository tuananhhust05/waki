const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let DismissalCallModel = null;

const getDismissalCallModel = async () => {
  if (!DismissalCallModel) {
    const connection = await getConnection();
    const dismissalCallSchema = new Schema({
      student_id: { type: Schema.Types.ObjectId, ref: 'school_students', required: true },
      parent_id: { type: Schema.Types.ObjectId, ref: 'school_users', required: true },
      school_id: { type: Schema.Types.ObjectId, ref: 'school_schools', required: true },
      call_time: { type: Date, default: Date.now },
      status: { type: String, default: 'pending' },
      pickup_time: Date,
      notes: String,
      created_at: { type: Date, default: Date.now }
    });
    DismissalCallModel = connection.model('DismissalCall', dismissalCallSchema, 'school_dismissal_calls');
  }
  return DismissalCallModel;
};

module.exports = getDismissalCallModel;
