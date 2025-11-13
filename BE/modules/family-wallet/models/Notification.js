const { Schema } = require('mongoose');
const getConnection = require('../config/database');

let NotificationModel = null;

const getNotificationModel = async () => {
  if (!NotificationModel) {
    const connection = await getConnection();
    const notificationSchema = new Schema({
      user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      family_id: { type: Schema.Types.ObjectId, ref: 'Family', required: true },
      type: { type: String, required: true },
      title: { type: String, required: true },
      message: { type: String, required: true },
      is_read: { type: Boolean, default: false },
      created_at: { type: Date, default: Date.now }
    });
    NotificationModel = connection.model('Notification', notificationSchema, 'family_wallet_notifications');
  }
  return NotificationModel;
};

module.exports = getNotificationModel;
