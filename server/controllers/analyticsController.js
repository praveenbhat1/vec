import Alert from '../models/Alert.js';

export const getIncidentDistribution = async (req, res) => {
  try {
    const distribution = await Alert.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getResponseTrends = async (req, res) => {
    try {
      const trends = await Alert.aggregate([
        { $match: { status: 'resolved' } },
        { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            avgResponse: { $avg: "$responseTime" }
        }},
        { $sort: { _id: 1 } }
      ]);
      res.json(trends);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
};

export const getIncidentTrends = async (req, res) => {
    try {
      const trends = await Alert.aggregate([
        { $group: {
            _id: { $dateToString: { format: "%H:00", date: "$createdAt" } },
            count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]);
      res.json(trends);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
};
