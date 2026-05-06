'use client';
import { useState } from 'react';
import { Mail } from 'lucide-react';
import apiService from '@/services/api';

export default function RequestOTP({ onSuccess, email, setEmail }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await apiService.forgotPassword(email);
            const data = await res.json();
            if (res.ok) {
                onSuccess();
            } else {
                setError(data.message || 'Failed to send OTP. Please check your email.');
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
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Step 1 of 3</p>
                <h2 className="text-lg font-medium text-slate-800">Forgot Password?</h2>
                <p className="mt-1 text-sm text-slate-500">Enter your registered email address to receive a verification code.</p>
            </header>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="doctor@clinic.com"
                            className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-4 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            required
                        />
                    </div>
                </div>
                {error && (
                    <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-100 p-3">
                        <p className="text-xs font-medium text-red-600">{error}</p>
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0052cc] py-3 text-sm font-semibold text-white transition hover:bg-[#0747a6] disabled:bg-slate-300"
                >
                    {loading ? 'Sending Code...' : 'Send Verification Code'}
                </button>
            </form>
        </div>
    );
}
