const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');
const getStudentModel = require('../models/Student');
const getSchoolModel = require('../models/School');
const getUserModel = require('../models/User');
const { body, validationResult } = require('express-validator');

const buildStudentResponse = (student) => ({
  id: student._id,
  full_name: student.full_name,
  student_id: student.student_id,
  grade: student.grade,
  class_name: student.class_name,
  photo_base64: student.photo_base64,
  created_at: student.created_at
});

const generateStudentId = () => {
  const partA = Date.now().toString(36).toUpperCase();
  const partB = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `S-${partA}-${partB}`;
};

const ENGINE_API_URL = process.env.ENGINE_API_URL || 'http://54.79.147.183:9595';

const router = express.Router();

router.get('/my-students', authenticateToken, async (req, res) => {
  try {
    const User = await getUserModel();
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'school') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const School = await getSchoolModel();
    const Student = await getStudentModel();
    let school = await School.findOne({ admin_id: req.user.id });

    if (!school) {
      // Auto-provision a school record for this admin if it doesn't exist
      school = new School({
        name: `${user.full_name}'s School`,
        admin_id: req.user.id
      });
      await school.save();
    }

    const students = await Student.find({ school_id: school._id })
      .sort({ created_at: -1 });

    res.json({
      school: {
        id: school._id,
        name: school.name
      },
      students: students.map(buildStudentResponse)
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/',
  authenticateToken,
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('photo_base64').notEmpty().withMessage('Photo is required'),
    body('grade').optional().trim(),
    body('class_name').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const User = await getUserModel();
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role !== 'school') {
        return res.status(403).json({ error: 'Only school accounts can create students' });
      }

      const School = await getSchoolModel();
      const Student = await getStudentModel();

      let school = await School.findOne({ admin_id: req.user.id });
      if (!school) {
        school = new School({
          name: `${user.full_name}'s School`,
          admin_id: req.user.id
        });
        await school.save();
      }

      const { full_name, grade, class_name, photo_base64 } = req.body;

      const student = new Student({
        school_id: school._id,
        created_by: req.user.id,
        full_name,
        student_id: generateStudentId(),
        grade: grade || null,
        class_name: class_name || null,
        photo_base64
      });

      await student.save();

      // Register face data with engine service (non-blocking)
      if (photo_base64) {
        // Normalize base64: remove data URL prefix, whitespace, and ensure proper padding
        let normalizedBase64 = photo_base64;
        
        // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        if (normalizedBase64.includes(',')) {
          normalizedBase64 = normalizedBase64.split(',')[1];
        }
        
        // Remove all whitespace (spaces, newlines, tabs)
        normalizedBase64 = normalizedBase64.replace(/\s/g, '');
        
        // Add padding if needed (base64 strings must be multiple of 4)
        const missingPadding = normalizedBase64.length % 4;
        if (missingPadding) {
          normalizedBase64 += '='.repeat(4 - missingPadding);
        }
        
        axios.post(`${ENGINE_API_URL}/register`, {
          student_id: student._id.toString(),
          image: normalizedBase64
        }).catch((err) => {
          console.error('Engine register error:', err.response?.data || err.message);
        });
      }

      res.status(201).json({
        message: 'Student created successfully',
        student: buildStudentResponse(student)
      });
    } catch (error) {
      console.error('Create student error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
