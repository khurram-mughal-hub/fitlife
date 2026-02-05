import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm();

    const onSubmit = async (data) => {
        try {
            const response = await api.post('/auth/login', data);
            localStorage.setItem('user', JSON.stringify(response.data));

            // Redirect based on role
            if (['trainer', 'nutritionist', 'pharmacist'].includes(response.data.role)) {
                navigate('/staff-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            setError('root', {
                type: 'manual',
                message: error.response?.data?.message || 'Login failed',
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-mesh">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8 rounded-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to continue your fitness journey</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register('email', { required: 'Email is required' })}
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        error={errors.password?.message}
                        {...register('password', { required: 'Password is required' })}
                    />

                    {errors.root && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                            {errors.root.message}
                        </div>
                    )}

                    <Button type="submit" className="w-full" isLoading={isSubmitting}>
                        Sign In
                    </Button>
                </form>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-accent hover:text-accent-hover font-medium">
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
