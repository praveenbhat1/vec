import express from 'express';
import { createAlert, getAlerts, updateAlertStatus, getStats } from '../controllers/alertController.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Simple Auth Middleware
export const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return next(); // For simplicity, some routes may allow no token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({ error: "Please authenticate" });
    }
};

// Check role middleware
export const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return res.status(403).json({ error: "Access Denied" });
        }
        next();
    };
};

router.post('/', auth, createAlert);
router.get('/', getAlerts);
router.patch('/:id', auth, updateAlertStatus);
router.get('/stats', getStats);

export default router;
