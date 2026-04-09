import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  type: { type: String, enum: ['fire', 'flood', 'medical', 'accident'], required: true },
  location: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  status: { type: String, enum: ['active', 'responding', 'resolved'], default: 'active' },
  priority: { type: String, enum: ['low', 'medium', 'high'] },
  assignedTo: { type: String }, // e.g. "Fire Department", "Hospital", "NGO"
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedTime: { type: Date, default: Date.now },
  responseStartTime: { type: Date },
  resolvedTime: { type: Date },
  responseTime: { type: Number }, // in minutes or ms
}, { timestamps: true });

// Smart calculation middleware
alertSchema.pre('save', function(next) {
  if (this.isModified('severity') || this.isNew) {
    // Priority logic
    if (this.severity === 'high' || (this.type === 'fire' && (Date.now() - this.reportedTime) < 300000)) {
      this.priority = 'high';
    } else if (this.severity === 'medium') {
      this.priority = 'medium';
    } else {
      this.priority = 'low';
    }

    // Assignment logic
    if (this.type === 'fire') this.assignedTo = 'Fire Department';
    else if (this.type === 'medical') this.assignedTo = 'Emergency Hospital';
    else if (this.type === 'flood') this.assignedTo = 'NGO Response Team';
    else if (this.type === 'accident') this.assignedTo = 'Traffic Police';
  }

  // Response Time calculation
  if (this.isModified('resolvedTime') && this.responseStartTime) {
     this.responseTime = (this.resolvedTime - this.responseStartTime) / 60000; // minutes
  }

  next();
});

export default mongoose.model('Alert', alertSchema);
