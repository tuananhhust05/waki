const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const getFamilyModel = require('../models/Family');
const getFamilyMemberModel = require('../models/FamilyMember');
const getUserModel = require('../models/User');
const getWalletModel = require('../models/Wallet');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/my-family', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Load all models first to ensure they are registered
    const User = await getUserModel();
    const Family = await getFamilyModel();
    const FamilyMember = await getFamilyMemberModel();
    
    const family = await Family.findOne({
      $or: [
        { parent_id: userId },
        { _id: { $in: await FamilyMember.distinct('family_id', { user_id: userId }) } }
      ]
    }).populate('parent_id', 'full_name');

    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const members = await FamilyMember.find({ family_id: family._id })
      .populate('user_id', 'email full_name role phone');

    res.json({
      family: {
        id: family._id,
        name: family.name,
        parent_name: family.parent_id?.full_name,
        members: members.map(m => ({
          id: m.user_id._id,
          email: m.user_id.email,
          full_name: m.user_id.full_name,
          role: m.user_id.role,
          phone: m.user_id.phone,
          relationship: m.relationship
        }))
      }
    });
  } catch (error) {
    console.error('Get family error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/members', authenticateToken, async (req, res) => {
  try {
    const { email, full_name, phone, relationship, role } = req.body;
    const parentId = req.user.id;

    const Family = await getFamilyModel();
    const User = await getUserModel();
    const FamilyMember = await getFamilyMemberModel();
    const Wallet = await getWalletModel();

    const family = await Family.findOne({ parent_id: parentId });
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    let user = await User.findOne({ email });
    let generatedPassword = null;
    
    if (!user) {
      // Set default password for child account
      generatedPassword = 'child';
      const passwordHash = await bcrypt.hash(generatedPassword, 10);
      user = new User({
        email,
        password_hash: passwordHash,
        full_name,
        phone: phone || null,
        role: role || 'member'
      });
      await user.save();
    }

    const existingMember = await FamilyMember.findOne({
      family_id: family._id,
      user_id: user._id
    });

    if (!existingMember) {
      const familyMember = new FamilyMember({
        family_id: family._id,
        user_id: user._id,
        relationship: relationship || 'member'
      });
      await familyMember.save();

      const existingWallet = await Wallet.findOne({
        user_id: user._id,
        family_id: family._id
      });

      if (!existingWallet) {
        const wallet = new Wallet({
          user_id: user._id,
          family_id: family._id
        });
        await wallet.save();
      }
    }

    // Return password if new user was created
    const response = {
      message: 'Family member added successfully',
      member: {
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    };

    // Only return password if it's a newly created user
    if (generatedPassword) {
      response.password = generatedPassword;
      response.message = 'Family member added successfully. Please save the password for login.';
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
