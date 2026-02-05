import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'trainer', 'nutritionist', 'pharmacist', 'admin'],
        default: 'user',
    },
    // User specific fields
    age: {
        type: Number,
    },
    height: {
        type: Number, // in meters
    },
    weight: {
        type: Number, // in kg
    },
    bmi: {
        type: Number,
    },
    category: {
        type: String,
        enum: ['Underweight', 'Normal', 'Overweight', 'Obese'],
    },
    goal: {
        type: String,
    },
    medicalConditions: {
        type: String,
    },
    // Staff specific fields
    phone: {
        type: String,
    },
    degreeCertificate: {
        type: String, // path to uploaded file
    },
    specialization: {
        type: String,
    },
    experience: {
        type: Number, // years
    },
    bio: {
        type: String,
    },
    certificationNumber: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'inactive', 'rejected'],
        default: 'active', // 'pending' for staff
    },
    rejectionReason: {
        type: String,
    },
    assignedCategories: [{
        type: String,
        enum: ['Underweight', 'Normal', 'Overweight', 'Obese'],
    }],
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    approvedAt: {
        type: Date,
    },
    // Assignments (For Members)
    assignedTrainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    assignedNutritionist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    assignedPharmacist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

// Calculate BMI before saving if weight and height are present
userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.role === 'user' && this.weight && this.height) {
        this.bmi = this.weight / (this.height * this.height);

        if (this.bmi < 18.5) {
            this.category = 'Underweight';
        } else if (this.bmi < 25) {
            this.category = 'Normal';
        } else if (this.bmi < 30) {
            this.category = 'Overweight';
        } else {
            this.category = 'Obese';
        }

        // Automatic Staff Assignment
        const User = mongoose.models.User;
        if (User) {
            // Find a Trainer
            const trainer = await User.findOne({
                role: 'trainer',
                status: 'active',
                assignedCategories: this.category
            });
            if (trainer) this.assignedTrainer = trainer._id;

            // Find a Nutritionist
            const nutritionist = await User.findOne({
                role: 'nutritionist',
                status: 'active',
                assignedCategories: this.category
            });
            if (nutritionist) this.assignedNutritionist = nutritionist._id;

            // Find a Pharmacist
            const pharmacist = await User.findOne({
                role: 'pharmacist',
                status: 'active',
                assignedCategories: this.category
            });
            if (pharmacist) this.assignedPharmacist = pharmacist._id;
        }
    }

    if (['trainer', 'nutritionist', 'pharmacist'].includes(this.role) && this.isNew) {
        this.status = 'pending';
    }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
