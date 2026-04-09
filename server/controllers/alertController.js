import Alert from '../models/Alert.js';
import ActivityLog from '../models/ActivityLog.js';

export const createAlert = async (req, res) => {
  try {
    const alert = new Alert({ ...req.body, reportedBy: req.user?._id });
    const savedAlert = await alert.save();
    
    // Create activity log
    const log = new ActivityLog({
        type: 'alert_created',
        message: `New ${alert.type} alert created at ${alert.location}`,
        user: req.user?._id
    });
    await log.save();
    
    res.status(201).json(savedAlert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAlertStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: "Alert not found" });

    // Status transitions
    if (status === 'responding' && alert.status === 'active') {
       alert.responseStartTime = new Date();
    } else if (status === 'resolved' && alert.status === 'responding') {
       alert.resolvedTime = new Date();
    }
    
    alert.status = status;
    const updated = await alert.save();
    
    // Log activity
    const log = new ActivityLog({
        type: status === 'responding' ? 'dispatched' : 'resolved',
        message: `Alert ${alert.id} status updated to ${status}`,
        user: req.user?._id
    });
    await log.save();
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const total = await Alert.countDocuments();
    const active = await Alert.countDocuments({ status: 'active' });
    const resolved = await Alert.countDocuments({ status: 'resolved' });
    
    const resolvedAlerts = await Alert.find({ status: 'resolved' });
    const avgResponseTime = resolvedAlerts.length > 0 
      ? resolvedAlerts.reduce((acc, curr) => acc + (curr.responseTime || 0), 0) / resolvedAlerts.length 
      : 0;

    res.json({ total, active, resolved, avgResponseTime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
