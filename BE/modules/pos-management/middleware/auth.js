const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.POS_JWT_SECRET || 'pos_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = {
      ...user,
      id: mongoose.isValidObjectId(user.id) ? new mongoose.Types.ObjectId(user.id) : user.id
    };
    next();
  });
};

module.exports = { authenticateToken };
