import express from 'express';
import { protect, staff } from '../middleware/authMiddleware.js';
import { createPlan, getMyPlans, getCreatedPlans, getUserPlans, updatePlan, deletePlan } from '../controllers/planController.js';

const router = express.Router();

router.post('/', protect, staff, createPlan);
router.get('/my-plans', protect, getMyPlans);
router.get('/created-plans', protect, staff, getCreatedPlans);
router.get('/user/:userId', protect, staff, getUserPlans);
router.route('/:id').put(protect, staff, updatePlan).delete(protect, staff, deletePlan);

export default router;
