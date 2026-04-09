import express from 'express';
import { 
    getIncidentDistribution, 
    getResponseTrends, 
    getIncidentTrends 
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/distribution', getIncidentDistribution);
router.get('/response-trends', getResponseTrends);
router.get('/incident-trends', getIncidentTrends);

export default router;
