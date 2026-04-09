import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['alert_created', 'dispatched', 'resolved', 'resource_updated'], required: true },
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('ActivityLog', activityLogSchema);
