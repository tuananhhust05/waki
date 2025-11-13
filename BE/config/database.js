const mongoose = require('mongoose');

let connection = null;

const getConnection = async () => {
  if (!connection) {
    const mongoUri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;
    
    connection = mongoose.createConnection(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    connection.on('connected', () => {
      console.log('Connected to Waki MongoDB database');
    });
    
    connection.on('error', (err) => {
      console.error('Waki DB error:', err);
    });
  }
  return connection;
};

module.exports = getConnection;

