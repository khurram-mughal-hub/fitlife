import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Activity, AlertCircle, Trash2, Eye, X, Filter, FileText } from 'lucide-react';
import api from '../../services/api';
import Button from '../ui/Button';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null); // For Details Modal
    const [deletingId, setDeletingId] = useState(null); // For Delete Confirmation

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let filtered = users.filter(user =>
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        setFilteredUsers(filtered);
    }, [searchTerm, roleFilter, users]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
            setDeletingId(null);
            if (selectedUser && selectedUser._id === id) setSelectedUser(null);
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const getBmiColor = (bmi) => {
        if (!bmi) return 'text-gray-400';
        if (bmi < 18.5) return 'text-blue-400';
        if (bmi < 25) return 'text-green-400';
        if (bmi < 30) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getRoleBadge = (role) => {
        const styles = {
            member: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            trainer: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            nutritionist: 'bg-green-500/10 text-green-400 border-green-500/20',
            pharmacist: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            admin: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        const defaultStyle = 'bg-gray-500/10 text-gray-400 border-gray-500/20';

        // Normalize role string just in case
        const normalizedRole = role === 'user' ? 'member' : role;

        return (
            <span className={`px-2 py-1 rounded text-xs font-medium border uppercase ${styles[normalizedRole] || defaultStyle}`}>
                {normalizedRole}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-white">User Management</h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Role Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            className="bg-slate-800 border-slate-700 rounded-lg pl-10 pr-8 py-2 text-white text-sm focus:ring-1 focus:ring-accent focus:border-accent outline-none appearance-none cursor-pointer"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="user">Members</option>
                            <option value="trainer">Trainers</option>
                            <option value="nutritionist">Nutritionists</option>
                            <option value="pharmacist">Pharmacists</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full bg-slate-800 border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20 bg-slate-800 rounded-xl border border-slate-700">
                    <p className="text-gray-400">No users found matching your criteria.</p>
                </div>
            ) : (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-700/50 border-b border-slate-700 text-gray-400 text-sm">
                                    <th className="p-4 font-medium">User</th>
                                    <th className="p-4 font-medium">Role</th>
                                    <th className="p-4 font-medium">Status / BMI</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {filteredUsers.map((user, index) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-slate-700/30 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.name}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="p-4">
                                            {user.role === 'user' ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold ${getBmiColor(user.bmi)}`}>{user.bmi ? user.bmi.toFixed(1) : '-'}</span>
                                                    {user.category && (
                                                        <span className="text-xs text-gray-400">({user.category})</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className={`text-xs px-2 py-0.5 rounded ${user.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                    {user.status || 'Active'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {deletingId === user._id ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-red-400">Sure?</span>
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            className="text-red-400 hover:text-red-300 font-bold text-xs"
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingId(null)}
                                                            className="text-gray-400 hover:text-white text-xs"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeletingId(user._id)}
                                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-600 rounded-lg transition-colors"
                                                        title="Delete User"
                                                        disabled={user.role === 'admin'} // Prevent deleting admin easily
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-800 rounded-xl max-w-2xl w-full border border-slate-700 shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-700/30">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{selectedUser.name}</h3>
                                    <div className="flex gap-2">
                                        {getRoleBadge(selectedUser.role)}
                                        <span className="text-xs text-gray-400 flex items-center">{selectedUser.email}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Common Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-accent uppercase tracking-wider mb-2 border-b border-slate-700 pb-1">Personal Info</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 text-xs">Phone</p>
                                                <p className="text-white">{selectedUser.phone || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs">Joined</p>
                                                <p className="text-white">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Member Specific */}
                                    {selectedUser.role === 'user' && (
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-semibold text-accent uppercase tracking-wider mb-2 border-b border-slate-700 pb-1">Fitness Profile</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 text-xs">Height</p>
                                                    <p className="text-white">{selectedUser.height}m</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs">Weight</p>
                                                    <p className="text-white">{selectedUser.weight}kg</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs">BMI</p>
                                                    <p className={`font-bold ${getBmiColor(selectedUser.bmi)}`}>{selectedUser.bmi?.toFixed(1)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs">Category</p>
                                                    <p className="text-white">{selectedUser.category}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-gray-500 text-xs">Goal</p>
                                                    <p className="text-white">{selectedUser.goal || 'Not specified'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-gray-500 text-xs">Medical Conditions</p>
                                                    <p className="text-white">{selectedUser.medicalConditions || 'None'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Staff Specific */}
                                    {['trainer', 'nutritionist', 'pharmacist'].includes(selectedUser.role) && (
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-semibold text-accent uppercase tracking-wider mb-2 border-b border-slate-700 pb-1">Professional Profile</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 text-xs">Experience</p>
                                                    <p className="text-white">{selectedUser.experience} Years</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs">Specialization</p>
                                                    <p className="text-white">{selectedUser.specialization}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-gray-500 text-xs">Role Status</p>
                                                    <p className="text-white capitalize">{selectedUser.status}</p>
                                                </div>
                                                {selectedUser.degreeCertificate && (
                                                    <div className="col-span-2 mt-2">
                                                        <a
                                                            href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${selectedUser.degreeCertificate}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-accent text-xs hover:underline flex items-center gap-1"
                                                        >
                                                            <FileText className="w-3 h-3" /> View Certificate
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-4">
                                                <p className="text-gray-500 text-xs mb-1">Bio</p>
                                                <p className="text-gray-300 text-sm italic bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 mb-4">
                                                    "{selectedUser.bio}"
                                                </p>

                                                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2 border-t border-slate-700 pt-3">Assigned Members</p>
                                                <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden">
                                                    {users.filter(u => {
                                                        if (u.role !== 'user') return false;
                                                        if (selectedUser.role === 'trainer') return u.assignedTrainer?._id === selectedUser._id;
                                                        if (selectedUser.role === 'nutritionist') return u.assignedNutritionist?._id === selectedUser._id;
                                                        if (selectedUser.role === 'pharmacist') return u.assignedPharmacist?._id === selectedUser._id;
                                                        return false;
                                                    }).length > 0 ? (
                                                        <table className="w-full text-left text-xs">
                                                            <thead className="bg-slate-800/50 text-gray-400">
                                                                <tr>
                                                                    <th className="p-2 font-medium">Name</th>
                                                                    <th className="p-2 font-medium">Email</th>
                                                                    <th className="p-2 font-medium">Goal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-800">
                                                                {users.filter(u => {
                                                                    if (u.role !== 'user') return false;
                                                                    if (selectedUser.role === 'trainer') return u.assignedTrainer?._id === selectedUser._id;
                                                                    if (selectedUser.role === 'nutritionist') return u.assignedNutritionist?._id === selectedUser._id;
                                                                    if (selectedUser.role === 'pharmacist') return u.assignedPharmacist?._id === selectedUser._id;
                                                                    return false;
                                                                }).map(member => (
                                                                    <tr key={member._id} className="hover:bg-slate-800/30">
                                                                        <td className="p-2 text-white">{member.name}</td>
                                                                        <td className="p-2 text-gray-400">{member.email}</td>
                                                                        <td className="p-2 text-gray-300">{member.goal || '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <div className="p-3 text-center text-gray-500 text-xs text-italic">
                                                            No members currently assigned.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-700/30 border-t border-slate-700 flex justify-end">
                                <Button variant="secondary" onClick={() => setSelectedUser(null)}>Close</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
