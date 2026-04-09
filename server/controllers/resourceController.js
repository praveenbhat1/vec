import Resource from '../models/Resource.js';
import ActivityLog from '../models/ActivityLog.js';

export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateResourceStatus = async (req, res) => {
  try {
    const { deployed } = req.body;
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: "Resource not found" });

    resource.deployed = deployed;
    const updated = await resource.save();
    
    // Log activity
    const log = new ActivityLog({
        type: 'resource_updated',
        message: `Resource ${resource.name} updated: ${deployed} units deployed.`,
        user: req.user?._id
    });
    await log.save();
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
