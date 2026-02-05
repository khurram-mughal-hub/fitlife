import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, LogOut, Activity, Calendar, Search, X, MessageCircle, FileText, Trash2, Edit2 } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import ProgressChart from '../components/ui/ProgressChart';
import ChatBox from '../components/ui/ChatBox';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [myUsers, setMyUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedUserProgress, setSelectedUserProgress] = useState([]);
    const [selectedUserPlans, setSelectedUserPlans] = useState([]);
    const [planData, setPlanData] = useState({ title: '', week: '', type: 'workout', instructions: '' });
    const [chatTarget, setChatTarget] = useState(null);
    const [editingPlanId, setEditingPlanId] = useState(null);

    useEffect(() => {
        fetchMyUsers();
    }, []);

    const fetchMyUsers = async () => {
        try {
            const response = await api.get('/staff/my-users');
            setMyUsers(response.data);
        } catch (error) {
            console.error('Error fetching my users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdatePlan = async (e) => {
        e.preventDefault();
        try {
            if (editingPlanId) {
                // Update existing plan
                await api.put(`/plans/${editingPlanId}`, {
                    title: planData.title,
                    instructions: planData.instructions
                    // Not sending week/type as per backend restriction/simplification
                });
                alert('Plan updated successfully!');
            } else {
                // Create new plan
                await api.post('/plans', {
                    assignedTo: selectedClient._id,
                    ...planData
                });
                alert('Plan assigned successfully!');
            }

            setShowPlanModal(false);
            setPlanData({ title: '', week: '', type: 'workout', instructions: '' });
            setEditingPlanId(null);

            // Refresh history if open
            if (showHistoryModal && selectedClient) {
                handleViewPlans(selectedClient);
            }
        } catch (error) {
            console.error('Error saving plan:', error);
            alert(error.response?.data?.message || 'Failed to save plan');
        }
    };

    const handleViewProgress = async (client) => {
        setSelectedClient(client);
        try {
            const response = await api.get(`/progress/${client._id}`);
            setSelectedUserProgress(response.data);
            setShowProgressModal(true);
        } catch (error) {
            console.error('Error fetching user progress:', error);
            alert('Failed to fetch progress');
        }
    };

    const handleViewPlans = async (client) => {
        setSelectedClient(client);
        try {
            const response = await api.get(`/plans/user/${client._id}`);
            setSelectedUserPlans(response.data);
            setShowHistoryModal(true);
        } catch (error) {
            console.error('Error fetching user plans:', error);
            alert('Failed to fetch plans');
        }
    };

    const handleDeletePlan = async (planId) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            try {
                await api.delete(`/plans/${planId}`);
                alert('Plan deleted successfully');
                // Refresh list
                const updatedPlans = selectedUserPlans.filter(p => p._id !== planId);
                setSelectedUserPlans(updatedPlans);
            } catch (error) {
                console.error('Error deleting plan:', error);
                alert('Failed to delete plan');
            }
        }
    };

    const handleEditPlan = (plan) => {
        setPlanData({
            title: plan.title,
            week: plan.week,
            type: plan.type,
            instructions: plan.instructions
        });
        setEditingPlanId(plan._id);
        setShowHistoryModal(false); // Close history
        setShowPlanModal(true); // Open edit form
    };

    const openCreatePlanModal = (client) => {
        setSelectedClient(client);
        setPlanData({ title: '', week: '', type: 'workout', instructions: '' });
        setEditingPlanId(null);
        setShowPlanModal(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-mesh text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    {/* ... header content ... */}
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Welcome, {user?.name}
                        </h1>
                        <p className="text-gray-400 mt-2 flex items-center gap-2">
                            <span className="bg-accent/20 text-accent text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                {user?.role}
                            </span>
                            Dashboard
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="border-white/20 text-white hover:bg-white/10">
                        <LogOut className="w-4 h-4" /> Logout
                    </Button>
                </header>

                {/* Stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-card p-6 rounded-xl border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-400 text-sm">Assigned Users</p>
                                <h3 className="text-3xl font-bold mt-1">{myUsers.length}</h3>
                            </div>
                            <div className="p-3 bg-accent/20 rounded-lg text-accent">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                    {/* ... other stats placeholders ... */}
                    <div className="glass-card p-6 rounded-xl border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-400 text-sm">Pending Plans</p>
                                <h3 className="text-3xl font-bold mt-1">0</h3>
                            </div>
                            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-xl border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-400 text-sm">Active Sessions</p>
                                <h3 className="text-3xl font-bold mt-1">0</h3>
                            </div>
                            <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 md:p-8">
                    <h2 className="text-xl font-semibold mb-6">My Assigned Users</h2>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                        </div>
                    ) : myUsers.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-slate-700 rounded-xl">
                            <p className="text-gray-400 mb-2">No users assigned yet.</p>
                            <p className="text-sm text-gray-500">Wait for an admin to assign users to you.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myUsers.map((client, index) => (
                                <motion.div
                                    key={client._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl hover:bg-slate-800/80 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                                                {client.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white">{client.name}</h4>
                                                <p className="text-xs text-gray-400">{client.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setChatTarget({ id: client._id, name: client.name })}
                                            className="text-gray-400 hover:text-accent transition-colors"
                                            title="Chat with User"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-4 bg-black/20 p-3 rounded-lg">
                                        <div>
                                            <p className="text-gray-500 text-xs">BMI</p>
                                            <p className="font-medium">{client.bmi?.toFixed(1) || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Category</p>
                                            <p className="font-medium">{client.category || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Goal</p>
                                            <p className="font-medium truncate">{client.goal || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button size="sm" onClick={() => openCreatePlanModal(client)}>
                                            Assign Plan
                                        </Button>
                                        <Button size="sm" variant="outline" className="border-slate-600 hover:bg-slate-700" onClick={() => handleViewProgress(client)}>
                                            Progress
                                        </Button>
                                        <Button size="sm" variant="outline" className="border-slate-600 hover:bg-slate-700" onClick={() => handleViewPlans(client)}>
                                            Plans
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create/Edit Plan Modal */}
                {showPlanModal && selectedClient && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-800 rounded-xl max-w-lg w-full border border-slate-700 shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-700/30">
                                <h3 className="text-xl font-bold text-white">
                                    {editingPlanId ? 'Edit Plan' : 'Create Plan'} for {selectedClient.name}
                                </h3>
                                <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateOrUpdatePlan} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Week</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            disabled={!!editingPlanId} // Disable editing week
                                            className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-accent outline-none ${editingPlanId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            placeholder="e.g., 1"
                                            value={planData.week}
                                            onChange={(e) => setPlanData({ ...planData, week: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Plan Title</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-accent outline-none"
                                            placeholder="e.g., Weight Loss"
                                            value={planData.title}
                                            onChange={(e) => setPlanData({ ...planData, title: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Plan Type</label>
                                    <select
                                        className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-accent outline-none ${editingPlanId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={!!editingPlanId} // Disable editing type
                                        value={planData.type}
                                        onChange={(e) => setPlanData({ ...planData, type: e.target.value })}
                                    >
                                        <option value="workout">Workout Plan</option>
                                        <option value="diet">Diet Plan</option>
                                        <option value="medical">Medical Recommendation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Instructions / Details</label>
                                    <textarea
                                        required
                                        rows="5"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Enter the details of the plan..."
                                        value={planData.instructions}
                                        onChange={(e) => setPlanData({ ...planData, instructions: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button variant="secondary" type="button" onClick={() => setShowPlanModal(false)}>Cancel</Button>
                                    <Button type="submit">{editingPlanId ? 'Update Plan' : 'Assign Plan'}</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Progress Modal */}
                {showProgressModal && selectedClient && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-800 rounded-xl max-w-3xl w-full border border-slate-700 shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-700/30">
                                <h3 className="text-xl font-bold text-white mb-1">
                                    Progress for {selectedClient.name}
                                </h3>
                                <button onClick={() => setShowProgressModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="h-80 w-full mb-6">
                                    <ProgressChart data={selectedUserProgress} />
                                </div>
                                <h4 className="font-semibold mb-4 text-gray-300">History Log</h4>
                                <div className="max-h-48 overflow-y-auto pr-2">
                                    {selectedUserProgress.length === 0 ? (
                                        <p className="text-gray-500 italic">No logs available.</p>
                                    ) : (
                                        <table className="w-full text-sm text-left text-gray-400">
                                            <thead className="text-xs text-gray-500 uppercase bg-slate-700/50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2">Date</th>
                                                    <th className="px-4 py-2">Weight (kg)</th>
                                                    <th className="px-4 py-2">BMI</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedUserProgress.map((log) => (
                                                    <tr key={log._id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                                                        <td className="px-4 py-2">{new Date(log.date).toLocaleDateString()}</td>
                                                        <td className="px-4 py-2">{log.weight}</td>
                                                        <td className="px-4 py-2">{log.bmi.toFixed(1)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-700 bg-slate-900/50 text-right">
                                <Button variant="secondary" onClick={() => setShowProgressModal(false)}>Close</Button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Plan History Modal */}
                {showHistoryModal && selectedClient && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-800 rounded-xl max-w-3xl w-full border border-slate-700 shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-700/30">
                                <h3 className="text-xl font-bold text-white mb-1">
                                    Plan History for {selectedClient.name}
                                </h3>
                                <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="max-h-[500px] overflow-y-auto pr-2">
                                    {selectedUserPlans.length === 0 ? (
                                        <p className="text-gray-500 italic">No plans assigned yet.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {selectedUserPlans.map((plan) => {
                                                const canEdit = plan.assignedBy?._id === user._id || plan.assignedBy === user._id;

                                                return (
                                                    <div key={plan._id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 relative group">
                                                        {canEdit && (
                                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleEditPlan(plan)}
                                                                    className="p-1 text-blue-400 hover:bg-blue-400/10 rounded"
                                                                    title="Edit Plan"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeletePlan(plan._id)}
                                                                    className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                                                                    title="Delete Plan"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-start mb-2 pr-16">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="bg-accent text-slate-900 text-xs font-bold px-2 py-0.5 rounded uppercase">
                                                                        {plan.type}
                                                                    </span>
                                                                    <span className="text-gray-400 text-xs">
                                                                        Week {plan.week || '?'}
                                                                    </span>
                                                                </div>
                                                                <h4 className="font-bold text-white mt-1">{plan.title}</h4>
                                                            </div>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(plan.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-300 text-sm whitespace-pre-line">{plan.instructions}</p>
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            Assigned By: {plan.assignedBy?.name || 'Unknown'}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-700 bg-slate-900/50 text-right">
                                <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>
                            </div>
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
        </div >
    );
};

export default StaffDashboard;
