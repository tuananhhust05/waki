const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let AttendanceModel = null;

const getAttendanceModel = async () => {
  if (!AttendanceModel) {
    const connection = await getConnection();
    const attendanceSchema = new Schema({
      student_id: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
      school_id: { type: Schema.Types.ObjectId, ref: 'School', required: true },
      attendance_date: { type: Date, required: true },
      check_in_time: Date,
      check_out_time: Date,
      status: { type: String, default: 'present' },
      notes: String,
      created_at: { type: Date, default: Date.now }
    });
    AttendanceModel = connection.model('Attendance', attendanceSchema, 'school_attendances');
  }
  return AttendanceModel;
};

module.exports = getAttendanceModel;
