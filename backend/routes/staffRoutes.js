import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMyUsers } from '../controllers/staffController.js';

const router = express.Router();

router.get('/my-users', protect, getMyUsers);

export default router;
