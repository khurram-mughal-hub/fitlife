import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';
import { Upload, User, Activity, Heart, Pill } from 'lucide-react';
import { clsx } from 'clsx';

const ROLES = [
    { id: 'user', label: 'Member', icon: User },
    { id: 'trainer', label: 'Trainer', icon: Activity },
    { id: 'nutritionist', label: 'Nutritionist', icon: Heart },
    { id: 'pharmacist', label: 'Pharmacist', icon: Pill },
];

const Signup = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('user');
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError, watch } = useForm();

    // Watch password for confirmation
    const password = watch('password');

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();

            // Append common fields
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('password', data.password);
            formData.append('role', selectedRole);
            formData.append('age', data.age);

            // Append role specific fields
            if (selectedRole === 'user') {
                formData.append('height', data.height);
                formData.append('weight', data.weight);
                formData.append('goal', data.goal);
                formData.append('medicalConditions', data.medicalConditions || '');
            } else {
                formData.append('phone', data.phone);
                formData.append('specialization', data.specialization);
                formData.append('experience', data.experience);
                formData.append('bio', data.bio);
                formData.append('certificationNumber', data.certificationNumber || '');
                if (data.degreeCertificate?.[0]) {
                    formData.append('degreeCertificate', data.degreeCertificate[0]);
                }
            }

            await api.post('/auth/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Redirect to login or success page
            navigate('/login');
        } catch (error) {
            console.error(error);
            setError('root', {
                type: 'manual',
                message: error.response?.data?.message || 'Registration failed',
            });
        }
    };

    return (
        <div className="min-h-screen py-10 flex items-center justify-center bg-gradient-mesh">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-purple-600/20 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] bg-blue-600/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-2xl p-8 rounded-2xl relative z-10 mx-4"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-gray-400">Join FitLife today</p>
                </div>

                {/* Role Selection */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {ROLES.map((role) => {
                        const Icon = role.icon;
                        const isSelected = selectedRole === role.id;
                        return (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() => setSelectedRole(role.id)}
                                className={clsx(
                                    'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300',
                                    isSelected
                                        ? 'bg-accent/20 border-accent text-accent'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                )}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-sm font-medium">{role.label}</span>
                            </button>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            error={errors.name?.message}
                            {...register('name', { required: 'Name is required' })}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            error={errors.email?.message}
                            {...register('email', { required: 'Email is required' })}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            error={errors.password?.message}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Min 6 characters' }
                            })}
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            error={errors.confirmPassword?.message}
                            {...register('confirmPassword', {
                                required: 'Confirm password',
                                validate: val => val === password || 'Passwords do not match'
                            })}
                        />
                        <Input
                            label="Age"
                            type="number"
                            placeholder="25"
                            error={errors.age?.message}
                            {...register('age', { required: 'Age is required' })}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedRole}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-6 overflow-hidden"
                        >
                            <div className="h-px bg-white/10 my-6" />
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {selectedRole === 'user' ? 'Physical Profile' : 'Professional Details'}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {selectedRole === 'user' ? (
                                    <>
                                        <Input
                                            label="Height (m)"
                                            type="number"
                                            step="0.01"
                                            placeholder="1.75"
                                            error={errors.height?.message}
                                            {...register('height', { required: 'Height is required' })}
                                        />
                                        <Input
                                            label="Weight (kg)"
                                            type="number"
                                            step="0.1"
                                            placeholder="70"
                                            error={errors.weight?.message}
                                            {...register('weight', { required: 'Weight is required' })}
                                        />
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Fitness Goal</label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-accent focus:ring-1 focus:ring-accent transition-all [&>option]:bg-slate-800"
                                                {...register('goal', { required: 'Goal is required' })}
                                            >
                                                <option value="">Select a goal</option>
                                                <option value="weight_loss">Weight Loss</option>
                                                <option value="muscle_gain">Muscle Gain</option>
                                                <option value="maintenance">Maintenance</option>
                                                <option value="flexibility">Flexibility</option>
                                            </select>
                                            {errors.goal && <p className="mt-1 text-sm text-red-500 ml-1">{errors.goal.message}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input
                                                label="Medical Conditions (Optional)"
                                                placeholder="None, Asthma, etc."
                                                {...register('medicalConditions')}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Input
                                            label="Phone Number"
                                            type="tel"
                                            placeholder="+1234567890"
                                            error={errors.phone?.message}
                                            {...register('phone', { required: 'Phone is required' })}
                                        />
                                        <Input
                                            label="Years of Experience"
                                            type="number"
                                            placeholder="5"
                                            error={errors.experience?.message}
                                            {...register('experience', { required: 'Experience is required' })}
                                        />
                                        <div className="md:col-span-2">
                                            <Input
                                                label="Specialization"
                                                placeholder="e.g. Strength Training, Keto Diet, Pediatric"
                                                error={errors.specialization?.message}
                                                {...register('specialization', { required: 'Specialization is required' })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Bio</label>
                                            <textarea
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                                rows="3"
                                                placeholder="Tell us about yourself..."
                                                {...register('bio', { required: 'Bio is required' })}
                                            />
                                            {errors.bio && <p className="mt-1 text-sm text-red-500 ml-1">{errors.bio.message}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input
                                                label="Certification Number"
                                                placeholder="CERT-12345"
                                                {...register('certificationNumber')}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                                                Degree/Certificate Upload
                                            </label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-xl hover:bg-white/5 transition-all">
                                                <div className="space-y-1 text-center">
                                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="flex text-sm text-gray-400">
                                                        <label className="relative cursor-pointer rounded-md font-medium text-accent hover:text-accent-hover">
                                                            <span>{watch('degreeCertificate')?.[0]?.name || 'Upload a file'}</span>
                                                            <input
                                                                type="file"
                                                                className="sr-only"
                                                                accept="image/*,.pdf"
                                                                {...register('degreeCertificate', {
                                                                    required: 'Certificate is required',
                                                                    onChange: (e) => {
                                                                        // Force re-render to show filename
                                                                        // The watch() in the span assumes react-hook-form re-renders on change, 
                                                                        // if not we might need local state. 
                                                                        // But watch() usually triggers re-render for subscribed fields.
                                                                    }
                                                                })}
                                                            />
                                                        </label>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG, PDF up to 10MB
                                                    </p>
                                                </div>
                                            </div>
                                            {errors.degreeCertificate && <p className="mt-1 text-sm text-red-500 ml-1">{errors.degreeCertificate.message}</p>}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {errors.root && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                            {errors.root.message}
                        </div>
                    )}

                    <Button type="submit" className="w-full" isLoading={isSubmitting}>
                        Create Account
                    </Button>
                </form>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-accent hover:text-accent-hover font-medium">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
