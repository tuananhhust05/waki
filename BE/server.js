require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3301;

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

// Make io available to routes
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join user room when authenticated
  socket.on('join-user-room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Leave user room
  socket.on('leave-user-room', (userId) => {
    socket.leave(`user_${userId}`);
    console.log(`User ${userId} left their room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

//  Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Waki Platform Backend' });
});

// Load modules for each solution
app.use('/api/family-wallet', require('./modules/family-wallet/routes'));
app.use('/api/pos-management', require('./modules/pos-management/routes'));
app.use('/api/ai-technologies', require('./modules/ai-technologies/routes'));
app.use('/api/school-services', require('./modules/school-services/routes'));

// Start server
server.listen(PORT, () => {
  console.log(`Waki Platform Backend running on port ${PORT}`);
  console.log('Available modules:');
  console.log('  - Family Wallet: /api/family-wallet');
  console.log('  - POS Management: /api/pos-management');
  console.log('  - AI Technologies: /api/ai-technologies');
  console.log('  - School Services: /api/school-services');
  console.log('Socket.io server initialized');
});

module.exports = app;


