import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    weight: {
        type: Number,
        required: true,
    },
    bmi: {
        type: Number,
        required: true,
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true,
});

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
