const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let StudentModel = null;

const getStudentModel = async () => {
  if (!StudentModel) {
    const connection = await getConnection();
    const studentSchema = new Schema({
      school_id: { type: Schema.Types.ObjectId, ref: 'School', required: true },
      created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      full_name: { type: String, required: true },
      student_id: { type: String, unique: true, sparse: true },
      grade: String,
      class_name: String,
      photo_base64: String,
      created_at: { type: Date, default: Date.now }
    });
    StudentModel = connection.model('Student', studentSchema, 'school_students');
  }
  return StudentModel;
};

module.exports = getStudentModel;
