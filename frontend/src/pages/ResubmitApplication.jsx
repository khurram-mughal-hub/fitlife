import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';
import { Upload } from 'lucide-react';

const ResubmitApplication = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            // Pre-fill form if you want, though user object might not have all details 
            // unless fetched from an endpoint. For now, we assume user knows what to fill.
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            formData.append('phone', data.phone);
            formData.append('specialization', data.specialization);
            formData.append('experience', data.experience);
            formData.append('bio', data.bio);
            formData.append('certificationNumber', data.certificationNumber || '');

            if (data.degreeCertificate?.[0]) {
                formData.append('degreeCertificate', data.degreeCertificate[0]);
            }

            const response = await api.put('/auth/resubmit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Update local storage
            localStorage.setItem('user', JSON.stringify(response.data));
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen py-10 flex items-center justify-center bg-gradient-mesh p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-2xl p-8 rounded-2xl relative z-10"
            >
                <h1 className="text-3xl font-bold text-white mb-6 text-center">Resubmit Application</h1>
                <p className="text-gray-400 text-center mb-8">
                    Please update your details to address the rejection reason.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                placeholder="e.g. Strength Training, Keto Diet"
                                error={errors.specialization?.message}
                                {...register('specialization', { required: 'Specialization is required' })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Bio</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                rows="3"
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
                                New Certificate (Optional)
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
                                                {...register('degreeCertificate')}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">Leave empty to keep existing</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" isLoading={isSubmitting}>
                        Resubmit Application
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResubmitApplication;
