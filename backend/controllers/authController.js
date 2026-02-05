import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Removed status check to allow pending/rejected users to login and see their status
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                status: user.status,
                rejectionReason: user.rejectionReason,
                // Include BMI and category for immediate use
                bmi: user.bmi,
                category: user.category
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile (fresh data)
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                rejectionReason: user.rejectionReason,
                bmi: user.bmi,
                category: user.category,
                weight: user.weight,
                height: user.height,
                age: user.age,
                goal: user.goal
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Resubmit staff application
// @route   PUT /api/auth/resubmit
// @access  Private
const resubmitApplication = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Update fields
            const { phone, specialization, experience, bio, certificationNumber } = req.body;

            user.phone = phone || user.phone;
            user.specialization = specialization || user.specialization;
            user.experience = experience || user.experience;
            user.bio = bio || user.bio;
            user.certificationNumber = certificationNumber || user.certificationNumber;

            // Handle file upload
            if (req.file) {
                // Store relative path (cross-platform compatible)
                user.degreeCertificate = `uploads/${req.file.filename}`;
            }

            // Reset status to pending
            user.status = 'pending';
            user.rejectionReason = undefined; // Clear previous rejection reason

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
                status: updatedUser.status
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            age,
            height,
            weight,
            goal,
            medicalConditions,
            phone,
            specialization,
            experience,
            bio,
            certificationNumber,
        } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let userData = {
            name,
            email,
            password,
            role,
            age,
        };

        if (role === 'user') {
            userData = {
                ...userData,
                height,
                weight,
                goal,
                medicalConditions,
            };
        } else if (['trainer', 'nutritionist', 'pharmacist'].includes(role)) {
            userData = {
                ...userData,
                phone,
                specialization,
                experience,
                bio,
                certificationNumber,
                status: 'pending', // Explicitly set pending
            };

            if (req.file) {
                // Store relative path (cross-platform compatible)
                userData.degreeCertificate = `uploads/${req.file.filename}`;
            }
        }

        const user = await User.create(userData);

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                status: user.status
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { loginUser, registerUser, resubmitApplication, getUserProfile };
