const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const getSchoolModel = require('../models/School');
const getStudentModel = require('../models/Student');
const getAttendanceModel = require('../models/Attendance');
const getUserModel = require('../models/User');
const router = express.Router();

const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const User = await getUserModel();
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'school') {
      return res.status(403).json({ error: 'Only school accounts can access the dashboard' });
    }

    const School = await getSchoolModel();
    let school = await School.findOne({ admin_id: req.user.id });
    if (!school) {
      school = new School({
        name: `${user.full_name}'s School`,
        admin_id: req.user.id
      });
      await school.save();
    }

    const Student = await getStudentModel();
    const totalStudents = await Student.countDocuments({ school_id: school._id });

    const today = normalizeDate(new Date());
    const Attendance = await getAttendanceModel();
    const todaysAttendance = await Attendance.countDocuments({
      school_id: school._id,
      attendance_date: today,
      status: 'present'
    });

    const recentStudents = await Student.find({ school_id: school._id })
      .sort({ created_at: -1 })
      .limit(5)
      .select('full_name grade class_name created_at');

    const recentAttendance = await Attendance.find({ school_id: school._id })
      .sort({ attendance_date: -1, check_in_time: -1 })
      .limit(5)
      .populate('student_id', 'full_name grade class_name');

    res.json({
      school: {
        id: school._id,
        name: school.name
      },
      metrics: {
        totalStudents,
        todaysAttendance
      },
      recentStudents: recentStudents.map(student => ({
        id: student._id,
        full_name: student.full_name,
        grade: student.grade,
        class_name: student.class_name,
        created_at: student.created_at
      })),
      recentAttendance: recentAttendance.map(record => ({
        id: record._id,
        student_name: record.student_id?.full_name,
        grade: record.student_id?.grade,
        class_name: record.student_id?.class_name,
        attendance_date: record.attendance_date,
        check_in_time: record.check_in_time,
        status: record.status
      }))
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
