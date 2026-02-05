import User from '../models/User.js';

// @desc    Get all pending staff
// @route   GET /api/admin/pending-staff
// @access  Private/Admin
const getPendingStaff = async (req, res) => {
    try {
        const pendingStaff = await User.find({
            role: { $in: ['trainer', 'nutritionist', 'pharmacist'] },
            status: 'pending'
        }).select('-password');
        res.json(pendingStaff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update staff status (Approve/Reject)
// @route   PUT /api/admin/staff/:id/status
// @access  Private/Admin
const updateStaffStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;
        const user = await User.findById(req.params.id);

        if (user) {
            user.status = status;
            if (status === 'rejected' && reason) {
                user.rejectionReason = reason;
            }
            user.approvedBy = req.user._id;
            user.approvedAt = Date.now();

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active staff for category assignment
// @route   GET /api/admin/staff
// @access  Private/Admin
const getAllStaff = async (req, res) => {
    try {
        const staff = await User.find({
            role: { $in: ['trainer', 'nutritionist', 'pharmacist'] },
            status: 'active'
        }).select('-password');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update staff assigned categories
// @route   PUT /api/admin/staff/:id/categories
// @access  Private/Admin
const updateStaffCategories = async (req, res) => {
    try {
        const { categories } = req.body;
        const user = await User.findById(req.params.id);

        if (user) {
            user.assignedCategories = categories;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all registered users (All Roles)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        // Fetch all users, excluding password
        const users = await User.find({})
            .select('-password')
            .populate('assignedTrainer', 'name')
            .populate('assignedNutritionist', 'name')
            .populate('assignedPharmacist', 'name');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user & Clean up relationships (Cascading)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Cascading Logic: Unassign staff from users
            if (['trainer', 'nutritionist'].includes(user.role)) {
                // If Trainer is deleted
                if (user.role === 'trainer') {
                    await User.updateMany(
                        { assignedTrainer: user._id },
                        { $unset: { assignedTrainer: "" } }
                    );
                }
                // If Nutritionist is deleted
                if (user.role === 'nutritionist') {
                    await User.updateMany(
                        { assignedNutritionist: user._id },
                        { $unset: { assignedNutritionist: "" } }
                    );
                }
            }

            // Note: If a Pharmacist is deleted, no specific cascade needed yet.
            // If a Member is deleted, they just get removed.

            await user.deleteOne();
            res.json({ message: 'User removed and relationships cleaned up' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getPendingStaff, updateStaffStatus, getAllStaff, updateStaffCategories, getAllUsers, deleteUser };
