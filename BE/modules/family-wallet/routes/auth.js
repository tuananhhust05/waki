const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const getUserModel = require('../models/User');
const getFamilyModel = require('../models/Family');
const getFamilyMemberModel = require('../models/FamilyMember');
const getWalletModel = require('../models/Wallet');
const router = express.Router();

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, full_name, phone, role } = req.body;

    const User = await getUserModel();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password_hash: passwordHash,
      full_name,
      phone: phone || null,
      role: role || 'member'
    });
    await user.save();

    if (role === 'parent') {
      const Family = await getFamilyModel();
      const FamilyMember = await getFamilyMemberModel();
      const Wallet = await getWalletModel();

      const family = new Family({
        name: `${full_name}'s Family`,
        parent_id: user._id
      });
      await family.save();

      const familyMember = new FamilyMember({
        family_id: family._id,
        user_id: user._id,
        relationship: 'parent'
      });
      await familyMember.save();

      const wallet = new Wallet({
        user_id: user._id,
        family_id: family._id
      });
      await wallet.save();
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.FAMILY_WALLET_JWT_SECRET || 'family_wallet_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, email: user.email, full_name: user.full_name, role: user.role },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const User = await getUserModel();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.FAMILY_WALLET_JWT_SECRET || 'family_wallet_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: { id: user._id, email: user.email, full_name: user.full_name, role: user.role },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
