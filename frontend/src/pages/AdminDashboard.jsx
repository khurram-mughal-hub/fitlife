import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, FileText, Activity, Heart, Pill, LogOut } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import CategoryManagement from '../components/admin/CategoryManagement';
import UserManagement from '../components/admin/UserManagement';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [pendingStaff, setPendingStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'categories' | 'users'

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingStaff();
        }
    }, [activeTab]);

    const fetchPendingStaff = async () => {
        try {
            const response = await api.get('/admin/pending-staff');
            setPendingStaff(response.data);
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status, reason = null) => {
        try {
            await api.put(`/admin/staff/${id}/status`, { status, reason });
            setPendingStaff(prev => prev.filter(staff => staff._id !== id));
            setRejectingId(null);
            setRejectionReason('');
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'trainer': return Activity;
            case 'nutritionist': return Heart;
            case 'pharmacist': return Pill;
            default: return Activity;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-mesh text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">Manage staff applications and approvals</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="border-white/20 text-white hover:bg-white/10">
                        <LogOut className="w-4 h-4" /> Logout
                    </Button>
                </header>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/10 overflow-x-auto">
                    <button
                        className={`pb-3 px-1 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'pending' ? 'text-accent' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending Approvals
                        {activeTab === 'pending' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                    </button>
                    <button
                        className={`pb-3 px-1 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'categories' ? 'text-accent' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        Category Management
                        {activeTab === 'categories' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                    </button>
                    <button
                        className={`pb-3 px-1 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'users' ? 'text-accent' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setActiveTab('users')}
                    >
                        User Management
                        {activeTab === 'users' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                    </button>
                </div>

                <div className="min-h-[400px]">
                    {activeTab === 'pending' && (
                        <div className="glass-card rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                Pending Applications
                                <span className="bg-accent/20 text-accent text-sm px-2 py-0.5 rounded-full">
                                    {pendingStaff.length}
                                </span>
                            </h2>

                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : pendingStaff.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    No pending applications at the moment.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    <AnimatePresence mode="popLayout">
                                        {pendingStaff.map((staff) => {
                                            const Icon = getRoleIcon(staff.role);
                                            return (
                                                <motion.div
                                                    key={staff._id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
                                                >
                                                    <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                                                        <div className="flex gap-4">
                                                            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0">
                                                                <Icon className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="text-lg font-semibold">{staff.name}</h3>
                                                                    <span className="text-xs uppercase font-medium bg-white/10 px-2 py-0.5 rounded text-gray-300">
                                                                        {staff.role}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-400 mb-2">{staff.email} • {staff.phone}</p>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-300 mt-4 bg-black/20 p-4 rounded-lg">
                                                                    <p><span className="text-gray-500">Experience:</span> {staff.experience} years</p>
                                                                    <p><span className="text-gray-500">Specialization:</span> {staff.specialization}</p>
                                                                    <p><span className="text-gray-500">Cert. Number:</span> {staff.certificationNumber || 'N/A'}</p>
                                                                    <p className="md:col-span-2 mt-2"><span className="text-gray-500 block mb-1">Bio:</span> {staff.bio}</p>
                                                                </div>

                                                                {staff.degreeCertificate && (
                                                                    <div className="mt-4">
                                                                        <a
                                                                            href={`http://localhost:5000/${staff.degreeCertificate}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover hover:underline"
                                                                        >
                                                                            <FileText className="w-4 h-4" /> View Degree Certificate
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex md:flex-col gap-3 shrink-0 relative">
                                                            {rejectingId === staff._id ? (
                                                                <div className="absolute right-0 top-0 md:relative bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-xl z-20 w-64">
                                                                    <h4 className="text-sm font-medium mb-2">Reason for Rejection</h4>
                                                                    <textarea
                                                                        className="w-full bg-slate-800 border-slate-700 rounded p-2 text-sm text-white mb-2"
                                                                        rows="3"
                                                                        value={rejectionReason}
                                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                                        placeholder="Enter reason..."
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 flex-1 justify-center"
                                                                            onClick={() => handleStatusUpdate(staff._id, 'rejected', rejectionReason)}
                                                                        >
                                                                            Confirm
                                                                        </Button>
                                                                        <Button
                                                                            size="sm" variant="ghost" className="flex-1 justify-center"
                                                                            onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20 w-full md:w-32 justify-center"
                                                                        onClick={() => handleStatusUpdate(staff._id, 'active')}
                                                                    >
                                                                        <Check className="w-4 h-4" /> Approve
                                                                    </Button>
                                                                    <Button
                                                                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 w-full md:w-32 justify-center"
                                                                        onClick={() => setRejectingId(staff._id)}
                                                                    >
                                                                        <X className="w-4 h-4" /> Reject
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'categories' && <CategoryManagement />}

                    {activeTab === 'users' && <UserManagement />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
