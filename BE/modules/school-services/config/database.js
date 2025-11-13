// Sử dụng database chung cho tất cả modules
const getConnection = require('../../../config/database');

module.exports = getConnection;
