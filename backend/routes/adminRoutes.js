import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getPendingStaff,
    updateStaffStatus,
    getAllStaff,
    updateStaffCategories,
    getAllUsers,
    deleteUser
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/pending-staff', getPendingStaff);
router.put('/staff/:id/status', updateStaffStatus);
router.get('/staff', getAllStaff);
router.put('/staff/:id/categories', updateStaffCategories);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

export default router;
