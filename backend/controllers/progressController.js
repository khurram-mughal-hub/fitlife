import Progress from '../models/Progress.js';
import User from '../models/User.js';

// @desc    Add a new progress log (weight/bmi)
// @route   POST /api/progress
// @access  Private
const addProgress = async (req, res) => {
    try {
        const { weight, notes } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate new BMI
        let bmi = user.bmi;
        if (user.height) {
            bmi = weight / (user.height * user.height);
        }

        // Create Progress Log
        const progress = await Progress.create({
            userId: req.user._id,
            weight,
            bmi,
            notes,
            date: new Date()
        });

        // Update User's current stats
        user.weight = weight;
        user.bmi = bmi;

        // Recalculate Category if needed (User model pre-save will handle this logic usually, 
        // but we need to trigger the save)
        await user.save();

        res.status(201).json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get progress history for a user
// @route   GET /api/progress/:userId
// @access  Private (Self or Assigned Staff)
const getProgressHistory = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Authorization check: User can see own, Staff can see assigned
        // For simplicity allow if user is self or if user is staff (finer grain check can be added)
        if (req.user._id.toString() !== userId &&
            !['trainer', 'nutritionist', 'pharmacist', 'admin'].includes(req.user.role)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const history = await Progress.find({ userId }).sort({ date: 1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { addProgress, getProgressHistory };
