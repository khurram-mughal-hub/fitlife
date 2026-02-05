import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Plus, X, ChevronDown, Check } from 'lucide-react';
import Button from '../ui/Button';
import api from '../../services/api';

const CATEGORIES = ['Underweight', 'Normal', 'Overweight', 'Obese'];

const CategoryManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null); // For "Add Staff" modal
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await api.get('/admin/staff');
            setStaffList(response.data);
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (staffId, category) => {
        const staff = staffList.find(s => s._id === staffId);
        if (!staff) return;

        const currentCategories = staff.assignedCategories || [];
        if (currentCategories.includes(category)) return;

        const newCategories = [...currentCategories, category];

        try {
            await api.put(`/admin/staff/${staffId}/categories`, { categories: newCategories });
            // Optimistic update
            setStaffList(prev => prev.map(s =>
                s._id === staffId ? { ...s, assignedCategories: newCategories } : s
            ));
            setShowAddModal(false);
        } catch (error) {
            console.error('Error assigning category:', error);
        }
    };

    const handleRemoveStaff = async (staffId, category) => {
        const staff = staffList.find(s => s._id === staffId);
        if (!staff) return;

        const newCategories = staff.assignedCategories.filter(c => c !== category);

        try {
            await api.put(`/admin/staff/${staffId}/categories`, { categories: newCategories });
            // Optimistic update
            setStaffList(prev => prev.map(s =>
                s._id === staffId ? { ...s, assignedCategories: newCategories } : s
            ));
        } catch (error) {
            console.error('Error removing category:', error);
        }
    };

    const getStaffByCategory = (category) => {
        return staffList.filter(s => s.assignedCategories?.includes(category));
    };

    const getUnassignedStaffForCategory = (category) => {
        return staffList.filter(s => !s.assignedCategories?.includes(category));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">BMI Category Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CATEGORIES.map(category => (
                    <motion.div
                        key={category}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden"
                    >
                        <div className="p-4 bg-slate-700/50 flex justify-between items-center border-b border-slate-700">
                            <h3 className="text-lg font-bold text-white">{category}</h3>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setSelectedCategory(category); setShowAddModal(true); }}
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add Staff
                            </Button>
                        </div>

                        <div className="p-4 min-h-[150px]">
                            <div className="space-y-3">
                                {getStaffByCategory(category).length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">No staff assigned</p>
                                ) : (
                                    getStaffByCategory(category).map(staff => (
                                        <div key={staff._id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{staff.name}</p>
                                                    <p className="text-xs text-gray-400 capitalize">{staff.role}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveStaff(staff._id, category)}
                                                className="text-gray-400 hover:text-red-400 p-1 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add Staff Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">Add Staff to {selectedCategory}</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                                {getUnassignedStaffForCategory(selectedCategory).length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">All available staff already assigned.</p>
                                ) : (
                                    getUnassignedStaffForCategory(selectedCategory).map(staff => (
                                        <button
                                            key={staff._id}
                                            onClick={() => handleAddStaff(staff._id, selectedCategory)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-700/50 rounded-lg transition-colors text-left group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-700 group-hover:bg-slate-600 flex items-center justify-center text-gray-300">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{staff.name}</p>
                                                <p className="text-xs text-gray-400 capitalize">{staff.role}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CategoryManagement;
