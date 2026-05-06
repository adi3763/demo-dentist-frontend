'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  LogIn,
  ShieldCheck,
  Activity,
  ShieldAlert,
  Fingerprint,
  BriefcaseMedical
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.replace('/admin');
    }
  }, [loading, router, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const result = await login(email, password, { rememberMe });

    if (!result?.success) {
      setError(result?.message || 'Invalid credentials or access denied.');
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <div className="animate-pulse text-sm text-slate-400">Initializing Secure Session...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      {/* LEFT SIDEBAR - Dark Corporate Aesthetic */}
      <section className="relative hidden w-[45%] flex-col justify-between bg-[#1a2b4b] p-16 text-white lg:flex">
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/20 to-transparent" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-lg">
            <BriefcaseMedical size={22} className="text-white" />
          </div>
          <span className="text-xl font-medium tracking-tight">MediCore</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-lg font-normal text-slate-300">Reliable Clinical Systems</h2>
          <p className="max-w-md text-base leading-relaxed text-slate-400">
            Empowering healthcare administrators with precision tools for patient management,
            clinical workflows, and institutional stability.
          </p>

          {/* Image Placeholder - Matching the Hospital Hallway */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <img
              src="/images/login-page-img.png"
              alt="Clinical Facility"
              className="h-64 w-full object-cover opacity-80 brightness-75 contrast-125"
            />
          </div>

          <div className="mt-8 flex gap-12">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Efficiency</p>
              <p className="text-lg font-medium text-slate-200">99.9% Uptime</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Security</p>
              <p className="text-lg font-medium text-slate-200">AES-256 Encrypted</p>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE - Clean Form */}
      <section className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="w-full max-w-[400px]">
          <header className="mb-10">
            <h1 className="text-base font-normal text-slate-500">System Login</h1>
            <h2 className="mt-1 text-lg font-medium text-slate-800">Access the clinical administration portal.</h2>
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
                  placeholder="admin@medicore.com"
                  className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-4 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <button type="button" className="text-sm font-medium text-blue-600 hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-4 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="text-sm text-slate-600">
                Keep me logged in for 30 days
              </label>
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0052cc] py-3 text-sm font-semibold text-white transition hover:bg-[#0747a6] disabled:bg-slate-300"
            >
              {submitting ? 'Authenticating...' : 'Login'}
              {!submitting && <LogIn size={16} />}
            </button>
          </form>

          <footer className="mt-12 text-center">
            <p className="text-xs leading-relaxed text-slate-400">
              By logging in, you agree to the Institutional Data<br />
              Security Protocol and Privacy Policy. Unauthorized<br />
              access is strictly prohibited.
            </p>

            <div className="mt-6 flex justify-center gap-4 text-slate-400">
              <ShieldCheck size={16} />
              <Fingerprint size={16} />
              <Activity size={16} />
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}