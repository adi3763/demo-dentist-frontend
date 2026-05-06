'use client';
import { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import apiService from '@/services/api';

export default function ResetPassword({ onSuccess, email, otp }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match. Please try again.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await apiService.resetPassword(email, otp, password, confirmPassword);
            const data = await res.json();
            if (res.ok) {
                onSuccess();
            } else {
                setError(data.message || 'Failed to reset password. Please try again.');
            }
        } catch {
            setError('A network error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <header className="mb-8">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Step 3 of 3</p>
                <h2 className="text-lg font-medium text-slate-800">Set New Password</h2>
                <p className="mt-1 text-sm text-slate-500">Choose a strong password to protect your account.</p>
            </header>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">New Password</label>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                            className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-10 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                    <div className="relative">
                        <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-10 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            required
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                {error && (
                    <div className="rounded-md bg-red-50 border border-red-100 p-3">
                        <p className="text-xs font-medium text-red-600">{error}</p>
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0052cc] py-3 text-sm font-semibold text-white transition hover:bg-[#0747a6] disabled:bg-slate-300"
                >
                    {loading ? 'Updating Password...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}
