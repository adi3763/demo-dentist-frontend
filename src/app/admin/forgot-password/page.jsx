'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Mail, ShieldAlert, Lock, ArrowLeft,
    CheckCircle2, ShieldCheck, Fingerprint,
    Activity, BriefcaseMedical
} from 'lucide-react';
import RequestOTP from './components/RequestOTP';
import VerifyOTP from './components/VerifyOTP';
import ResetPassword from './components/ResetPassword';

// Step progress indicator shown in the left sidebar
const steps = [
    { icon: Mail, label: 'Request Code' },
    { icon: ShieldAlert, label: 'Verify OTP' },
    { icon: Lock, label: 'New Password' },
];

function SuccessStep() {
    const router = useRouter();
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50/50">
                <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Password Updated!</h2>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Your password has been reset successfully.<br />
                You can now log in with your new credentials.
            </p>
            <button
                onClick={() => router.push('/admin/login')}
                className="mt-10 w-full rounded-md bg-[#0052cc] py-3 text-sm font-semibold text-white transition hover:bg-[#0747a6]"
            >
                Return to Login
            </button>
        </div>
    );
}

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const router = useRouter();

    return (
        <div className="flex min-h-screen bg-white font-sans text-slate-900 overflow-hidden">
            {/* LEFT SIDEBAR */}
            <section className="relative hidden w-[45%] flex-col justify-between bg-[#1a2b4b] p-16 text-white lg:flex">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/20 to-transparent" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-lg">
                        <BriefcaseMedical size={22} className="text-white" />
                    </div>
                    <span className="text-xl font-medium tracking-tight">SunsKraft</span>
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-6">
                    <h2 className="text-lg font-normal text-slate-300">Identity Recovery</h2>
                    <p className="max-w-md text-base leading-relaxed text-slate-400">
                        We use a verified, multi-step process to ensure only authorized staff can recover access to clinical records.
                    </p>

                    {/* Step Progress Tracker */}
                    <div className="mt-12 rounded-2xl border border-white/10 bg-[#0f172a]/50 p-8">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-6">Recovery Progress</p>
                        <div className="space-y-5">
                            {steps.map(({ icon: Icon, label }, index) => {
                                const stepNum = index + 1;
                                const isDone = step > stepNum;
                                const isActive = step === stepNum;
                                return (
                                    <div key={label} className="flex items-center gap-4">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isDone ? 'bg-emerald-500' : isActive ? 'bg-blue-600 ring-4 ring-blue-600/30' : 'bg-slate-800'}`}>
                                            {isDone ? <CheckCircle2 size={16} className="text-white" /> : <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />}
                                        </div>
                                        <span className={`text-sm font-medium transition-colors duration-300 ${isDone ? 'text-emerald-400' : isActive ? 'text-white' : 'text-slate-600'}`}>
                                            {label}
                                        </span>
                                        {isActive && <span className="ml-auto text-[10px] font-bold text-blue-400 uppercase tracking-widest">Active</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* RIGHT SIDE */}
            <section className="flex flex-1 flex-col items-center justify-center px-8 relative">
                {/* Back button - hide on success */}
                {step < 4 && (
                    <button
                        onClick={() => step === 1 ? router.push('/admin/login') : setStep(s => s - 1)}
                        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        {step === 1 ? 'Back to Login' : 'Previous Step'}
                    </button>
                )}

                <div className="w-full max-w-[400px]">
                    {/* Slide transition wrapper */}
                    <div key={step} className="animate-in slide-in-from-right-8 fade-in duration-400">
                        {step === 1 && (
                            <RequestOTP
                                onSuccess={() => setStep(2)}
                                email={email}
                                setEmail={setEmail}
                            />
                        )}
                        {step === 2 && (
                            <VerifyOTP
                                onSuccess={() => setStep(3)}
                                email={email}
                                otp={otp}
                                setOtp={setOtp}
                            />
                        )}
                        {step === 3 && (
                            <ResetPassword
                                onSuccess={() => setStep(4)}
                                email={email}
                                otp={otp}
                            />
                        )}
                        {step === 4 && <SuccessStep />}
                    </div>

                    {step < 4 && (
                        <footer className="mt-12 text-center">
                            <p className="text-xs leading-relaxed text-slate-400">
                                Need help? Contact IT Support at<br />
                                <span className="text-slate-600 font-bold">support@SunsKraft.com</span>
                            </p>
                            <div className="mt-6 flex justify-center gap-4 text-slate-300">
                                <ShieldCheck size={16} />
                                <Fingerprint size={16} />
                                <Activity size={16} />
                            </div>
                        </footer>
                    )}
                </div>
            </section>
        </div>
    );
}
