'use client';
import { useState } from 'react';
import { X, Lock, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import apiService from '@/services/api';

export default function AccountSettingsModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [formData, setFormData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (formData.password !== formData.password_confirmation) {
            setStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        if (formData.password.length < 8) {
            setStatus({ type: 'error', message: 'Password must be at least 8 characters' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await apiService.changePassword(formData);
            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: 'Password updated successfully!' });
                setFormData({ current_password: '', password: '', password_confirmation: '' });
                setTimeout(() => {
                    onClose();
                    setStatus({ type: '', message: '' });
                }, 2000);
            } else {
                setStatus({ type: 'error', message: data.message || 'Failed to update password' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-[0_20px_70px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                            <ShieldCheck className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Security</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Settings</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all hover:shadow-sm">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 mx-2" />

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <ShieldCheck size={18} />
                            </div>
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                placeholder="Min. 8 characters"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <ShieldCheck size={18} />
                            </div>
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                placeholder="Repeat new password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Status Message */}
                    {status.message && (
                        <div className={`flex items-center gap-3 p-4 rounded-2xl animate-in slide-in-from-top-2 ${
                            status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                            <AlertCircle size={18} />
                            <p className="text-xs font-bold">{status.message}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white rounded-2xl py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
                    >
                        {loading ? 'Updating Security...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
