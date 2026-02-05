import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@fitlife.com',
            password: 'admin123', // Will be hashed by pre-save hook
            role: 'admin',
            status: 'active'
        });

        console.log('Admin user created successfully');
        console.log('Email: admin@fitlife.com');
        console.log('Password: admin123');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
