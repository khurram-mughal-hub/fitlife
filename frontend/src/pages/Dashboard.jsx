import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Calendar, LogOut, Plus, X, MessageCircle } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import AdminDashboard from './AdminDashboard';
import ProgressChart from '../components/ui/ProgressChart';
import ChatBox from '../components/ui/ChatBox';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [userProfile, setUserProfile] = useState(null); // Fresh data from DB
    const [plans, setPlans] = useState([]);
    const [progressHistory, setProgressHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWeightModal, setShowWeightModal] = useState(false);
    const [weightInput, setWeightInput] = useState('');
    const [chatTarget, setChatTarget] = useState(null); // { id, name }

    useEffect(() => {
        if (user && user.role !== 'admin') {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            // Fetch Fresh Profile (for BMI update)
            const profileRes = await api.get('/auth/profile');
            setUserProfile(profileRes.data);

            // Fetch Plans
            const plansRes = await api.get('/plans/my-plans');
            setPlans(plansRes.data);

            // Fetch Progress History
            const progressRes = await api.get(`/progress/${user._id}`);
            setProgressHistory(progressRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogWeight = async (e) => {
        e.preventDefault();
        try {
            await api.post('/progress', { weight: parseFloat(weightInput) });
            alert('Weight logged successfully!');
            setShowWeightModal(false);
            setWeightInput('');
            // Refresh data
            fetchDashboardData();
            // Update local storage user 'weight/bmi' if needed (basic version just refreshes page or ignores)
        } catch (error) {
            console.error('Error logging weight:', error);
            alert('Failed to log weight');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (user?.role === 'admin') {
        return <AdminDashboard />;
    }

    if (user?.status === 'pending') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl border border-slate-700 text-center">
                    <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Activity className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Account Locked</h2>
                    <p className="text-gray-400 mb-6">Your application is currently under review by an administrator. You will be notified once it is approved.</p>
                    <Button variant="outline" onClick={handleLogout} className="w-full justify-center">Logout</Button>
                </div>
            </div>
        );
    }

    if (user?.status === 'rejected') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl border border-slate-700 text-center">
                    <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Activity className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Application Rejected</h2>
                    <p className="text-gray-400 mb-4">Your application was rejected for the following reason:</p>
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mb-6 text-red-400 text-sm">
                        {user?.rejectionReason || 'No reason provided.'}
                    </div>
                    <div className="space-y-3">
                        <Button onClick={() => navigate('/resubmit')} className="w-full justify-center">Edit Application</Button>
                        <Button variant="outline" onClick={handleLogout} className="w-full justify-center">Logout</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-mesh text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Welcome back, {user?.name}
                        </h1>
                        <p className="text-gray-400 mt-2">Here's your fitness overview for today.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={() => setShowWeightModal(true)} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Log Weight
                        </Button>
                        <Button variant="outline" onClick={handleLogout} className="border-white/20 text-white hover:bg-white/10">
                            <LogOut className="w-4 h-4" /> Logout
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="glass-card p-6 rounded-xl border border-white/10 hover:border-accent/50 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-400 text-sm">Current BMI</p>
                                <h3 className="text-3xl font-bold mt-1">{userProfile?.bmi?.toFixed(1) || '-'}</h3>
                            </div>
                            <div className="p-3 bg-accent/20 rounded-lg text-accent group-hover:scale-110 transition-transform">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                        <p className={`text-sm ${userProfile?.category === 'Normal' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {userProfile?.category || 'Not calculated'}
                        </p>
                    </div>
                    {/* ... other stats cards ... */}
                    <div className="glass-card p-6 rounded-xl border border-white/10 col-span-1 md:col-span-2 lg:col-span-3">
                        <h3 className="text-gray-400 text-sm mb-4">Progress Overview</h3>
                        <div className="h-24"> {/* Adjusted height container for small preview or replace with full chart */}
                            <ProgressChart data={progressHistory} />
                        </div>
                    </div>
                </div>

                {/* My Plans Section */}
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-slate-900">
                        <Calendar className="w-5 h-5" />
                    </span>
                    My Assigned Plans
                </h2>

                {plans.length === 0 ? (
                    <div className="glass-card p-12 rounded-xl border border-white/10 text-center border-dashed">
                        <p className="text-gray-400 text-lg">No plans assigned yet.</p>
                        <p className="text-gray-500">Your trainer or nutritionist will assign plans shortly.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {plans.map((plan) => (
                            <motion.div
                                key={plan._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-6 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs text-accent font-bold uppercase tracking-wider mb-1">Week {plan.week}</p>
                                        <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${plan.type === 'workout' ? 'bg-orange-500/20 text-orange-400' :
                                        plan.type === 'diet' ? 'bg-green-500/20 text-green-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {plan.type}
                                    </span>
                                </div>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-400 mb-1">Assigned By</p>
                                    <div className="text-white font-medium flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs">
                                                {plan.assignedBy?.name.charAt(0)}
                                            </div>
                                            {plan.assignedBy?.name}
                                        </div>
                                        <button
                                            onClick={() => setChatTarget({ id: plan.assignedBy._id, name: plan.assignedBy.name })}
                                            className="text-gray-400 hover:text-accent transition-colors"
                                            title="Chat with Staff"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-black/30 p-4 rounded-lg text-gray-300 text-sm whitespace-pre-wrap font-mono">
                                    {plan.instructions}
                                </div>
                                <div className="mt-4 text-right">
                                    <span className="text-xs text-gray-500">
                                        {new Date(plan.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Log Weight Modal */}
                {showWeightModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-800 rounded-xl max-w-sm w-full border border-slate-700 shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-700/30">
                                <h3 className="text-xl font-bold text-white">Log Today's Weight</h3>
                                <button onClick={() => setShowWeightModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleLogWeight} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Current Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="e.g. 75.5"
                                        value={weightInput}
                                        onChange={(e) => setWeightInput(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button variant="secondary" type="button" onClick={() => setShowWeightModal(false)}>Cancel</Button>
                                    <Button type="submit">Log Weight</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Chat Modal */}
                {chatTarget && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <ChatBox
                            receiverId={chatTarget.id}
                            receiverName={chatTarget.name}
                            onClose={() => setChatTarget(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
