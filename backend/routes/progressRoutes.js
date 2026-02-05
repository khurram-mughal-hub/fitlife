import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { addProgress, getProgressHistory } from '../controllers/progressController.js';

const router = express.Router();

router.post('/', protect, addProgress);
router.get('/:userId', protect, getProgressHistory);

export default router;
