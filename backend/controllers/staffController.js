import User from '../models/User.js';

// @desc    Get users assigned to the logged-in staff member
// @route   GET /api/staff/my-users
// @access  Private/Staff
const getMyUsers = async (req, res) => {
    try {
        const staffId = req.user._id;
        const role = req.user.role; // trainer or nutritionist

        let query = {};
        if (role === 'trainer') {
            query = { assignedTrainer: staffId };
        } else if (role === 'nutritionist') {
            query = { assignedNutritionist: staffId };
        } else if (role === 'pharmacist') {
            query = { assignedPharmacist: staffId };
        } else {
            return res.status(400).json({ message: 'Invalid staff role' });
        }

        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getMyUsers };
