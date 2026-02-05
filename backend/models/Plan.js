import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['workout', 'diet', 'medical'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    week: {
        type: Number,
        required: true,
    },
    instructions: {
        type: String, // Storing plan details as text for flexibility (or JSON string)
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active',
    },
}, {
    timestamps: true,
});

const Plan = mongoose.model('Plan', planSchema);

export default Plan;
