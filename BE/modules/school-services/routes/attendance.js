const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const getAttendanceModel = require('../models/Attendance');
const getStudentModel = require('../models/Student');
const getSchoolModel = require('../models/School');
const getUserModel = require('../models/User');
const router = express.Router();

const ENGINE_API_URL = process.env.ENGINE_API_URL || 'http://192.168.22.57:9595';

const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const buildAttendanceResponse = (record) => ({
  id: record._id,
  student_id: record.student_id?._id || record.student_id,
  student_name: record.student_id?.full_name,
  grade: record.student_id?.grade,
  class_name: record.student_id?.class_name,
  attendance_date: record.attendance_date,
  check_in_time: record.check_in_time,
  status: record.status,
  notes: record.notes
});

router.post('/check-in', authenticateToken, async (req, res) => {
  try {
    const User = await getUserModel();
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'school') {
      return res.status(403).json({ error: 'Only school accounts can perform attendance' });
    }

    const School = await getSchoolModel();
    const school = await School.findOne({ admin_id: req.user.id });
    if (!school) {
      return res.status(400).json({ error: 'School profile not found for this account' });
    }

    const { image_base64, status = 'present', notes } = req.body;
    if (!image_base64) {
      return res.status(400).json({ error: 'image_base64 is required' });
    }

    const Student = await getStudentModel();
    let matchedStudent = null;

    try {
      const verifyResponse = await axios.post(`${ENGINE_API_URL}/verify`, {
        image: image_base64
      });

      const matches = verifyResponse.data?.matches || [];
      if (matches.length === 0) {
        return res.status(404).json({ error: 'No matching student found' });
      }

      for (const match of matches) {
        const candidate = await Student.findOne({ _id: match.student_id, school_id: school._id });
        if (candidate) {
          matchedStudent = candidate;
          break;
        }
      }
    } catch (err) {
      console.error('Engine verify error:', err.response?.data || err.message);
      return res.status(502).json({ error: 'Face recognition service unavailable' });
    }

    if (!matchedStudent) {
      return res.status(404).json({ error: 'No matching student found in this school' });
    }

    const Attendance = await getAttendanceModel();
    const today = normalizeDate(new Date());

    const attendance = new Attendance({
      student_id: matchedStudent._id,
      school_id: school._id,
      attendance_date: today,
      check_in_time: new Date(),
      status,
      notes: notes || null
    });
    await attendance.save();

    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendance: buildAttendanceResponse(attendance),
      student: {
        id: matchedStudent._id,
        full_name: matchedStudent.full_name,
        grade: matchedStudent.grade,
        class_name: matchedStudent.class_name,
        student_id: matchedStudent.student_id
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/school/history', authenticateToken, async (req, res) => {
  try {
    const User = await getUserModel();
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'school') {
      return res.status(403).json({ error: 'Only school accounts can view attendance history' });
    }

    const School = await getSchoolModel();
    const school = await School.findOne({ admin_id: req.user.id });
    if (!school) {
      return res.status(400).json({ error: 'School profile not found for this account' });
    }

    const Attendance = await getAttendanceModel();
    const records = await Attendance.find({ school_id: school._id })
      .sort({ attendance_date: -1, check_in_time: -1 })
      .limit(100)
      .populate('student_id', 'full_name grade class_name');

    res.json({
      records: records.map(buildAttendanceResponse)
    });
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
