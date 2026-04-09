import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['truck', 'ambulance', 'boat', 'drone'], required: true },
  total: { type: Number, default: 0 },
  deployed: { type: Number, default: 0 },
  available: { type: Number },
}, { timestamps: true });

resourceSchema.pre('save', function(next) {
  this.available = this.total - this.deployed;
  next();
});

export default mongoose.model('Resource', resourceSchema);
