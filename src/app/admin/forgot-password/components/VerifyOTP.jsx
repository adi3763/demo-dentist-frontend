'use client';
import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import apiService from '@/services/api';

export default function VerifyOTP({ onSuccess, email, otp, setOtp }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await apiService.verifyOtp(email, otp);
            const data = await res.json();
            if (res.ok) {
                onSuccess();
            } else {
                setError(data.message || 'Invalid or expired OTP. Please try again.');
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
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Step 2 of 3</p>
                <h2 className="text-lg font-medium text-slate-800">Verify Identity</h2>
                <p className="mt-1 text-sm text-slate-500">
                    We've sent a 6-digit code to{' '}
                    <span className="font-bold text-slate-700">{email}</span>.
                </p>
            </header>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Verification Code</label>
                    <div className="relative">
                        <ShieldAlert size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="• • • • • •"
                            className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-4 text-sm tracking-[0.5em] font-black text-center transition focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            required
                        />
                    </div>
                    <p className="text-xs text-slate-400">Enter the 6-digit code sent to your email.</p>
                </div>
                {error && (
                    <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-100 p-3">
                        <p className="text-xs font-medium text-red-600">{error}</p>
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0052cc] py-3 text-sm font-semibold text-white transition hover:bg-[#0747a6] disabled:bg-slate-300"
                >
                    {loading ? 'Verifying...' : 'Verify Code'}
                </button>
            </form>
        </div>
    );
}
