import express from 'express';
import { getResources, updateResourceStatus } from '../controllers/resourceController.js';
import { auth, authorize } from './alerts.js';

const router = express.Router();

router.get('/', getResources);
router.patch('/:id', auth, authorize(['admin', 'responder']), updateResourceStatus);

export default router;
