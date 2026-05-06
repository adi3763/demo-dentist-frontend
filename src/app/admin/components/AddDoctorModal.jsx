'use client';
import { useState } from 'react';
import { X, User, Mail, Phone, Stethoscope, GraduationCap, Clock, MapPin, Building2, FileText, DollarSign, Loader2, CheckCircle2 } from 'lucide-react';
import apiService from '@/services/api';

const InputField = ({ label, icon: Icon, required, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
            <input
                {...props}
                className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 ${Icon ? 'pl-9' : 'pl-3'} pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400`}
            />
        </div>
    </div>
);

const TextareaField = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
        <div className="relative">
            {Icon && <Icon size={15} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />}
            <textarea
                {...props}
                rows={3}
                className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 ${Icon ? 'pl-9' : 'pl-3'} pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 resize-none placeholder:text-slate-400`}
            />
        </div>
    </div>
);

export default function AddDoctorModal({ isOpen, onClose, onSuccess }) {
    const [form, setForm] = useState({
        name: '', email: '', phone: '', specialization: '',
        qualification: '', experience_years: '', address: '',
        city: '', state: '', pincode: '', bio: '', consultation_fee: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Build payload — only include non-empty optional fields
        const payload = { name: form.name, email: form.email };
        const optionals = ['phone', 'specialization', 'qualification', 'experience_years', 'address', 'city', 'state', 'pincode', 'bio', 'consultation_fee'];
        optionals.forEach(key => { if (form[key]) payload[key] = form[key]; });
        if (payload.experience_years) payload.experience_years = Number(payload.experience_years);

        try {
            const res = await apiService.createDoctor(payload);
            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess?.(data);
                    onClose();
                    setSuccess(false);
                    setForm({ name: '', email: '', phone: '', specialization: '', qualification: '', experience_years: '', address: '', city: '', state: '', pincode: '', bio: '', consultation_fee: '' });
                }, 1500);
            } else {
                setError(data.message || Object.values(data.errors || {}).flat().join(' ') || 'Failed to create doctor.');
            }
        } catch {
            setError('A network error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full sm:max-w-2xl bg-white sm:rounded-[32px] rounded-t-[32px] shadow-2xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">Add New Doctor</h2>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">Required fields are marked with <span className="text-red-500">*</span></p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all">
                        <X size={18} />
                    </button>
                </div>

                {/* Success State */}
                {success ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 gap-4">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={32} className="text-emerald-500" />
                        </div>
                        <p className="text-base font-black text-slate-800">Doctor Added Successfully!</p>
                        <p className="text-sm text-slate-400">The new doctor profile has been created.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* Required */}
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Basic Information</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Full Name" icon={User} placeholder="Dr. Anjali Verma" required value={form.name} onChange={set('name')} />
                                    <InputField label="Email Address" icon={Mail} type="email" placeholder="anjali@clinic.com" required value={form.email} onChange={set('email')} />
                                </div>
                            </div>

                            {/* Professional */}
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Professional Details</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Phone Number" icon={Phone} placeholder="9876500001" type="tel" value={form.phone} onChange={set('phone')} />
                                    <InputField label="Specialization" icon={Stethoscope} placeholder="Orthodontist" value={form.specialization} onChange={set('specialization')} />
                                    <InputField label="Qualification" icon={GraduationCap} placeholder="BDS, MDS Orthodontics" value={form.qualification} onChange={set('qualification')} />
                                    <InputField label="Experience (Years)" icon={Clock} type="number" min="0" placeholder="8" value={form.experience_years} onChange={set('experience_years')} />
                                    <InputField label="Consultation Fee (₹)" icon={DollarSign} type="number" min="0" placeholder="600" value={form.consultation_fee} onChange={set('consultation_fee')} />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Location</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <InputField label="Address" icon={MapPin} placeholder="Plot 12, Sector 18" value={form.address} onChange={set('address')} />
                                    </div>
                                    <InputField label="City" icon={Building2} placeholder="Noida" value={form.city} onChange={set('city')} />
                                    <InputField label="State" placeholder="Uttar Pradesh" value={form.state} onChange={set('state')} />
                                    <InputField label="Pincode" placeholder="201301" type="number" value={form.pincode} onChange={set('pincode')} />
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Bio</p>
                                <TextareaField label="Short Bio" icon={FileText} placeholder="Specialist in braces and clear aligners..." value={form.bio} onChange={set('bio')} />
                            </div>

                            {error && (
                                <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                                    <p className="text-sm font-medium text-red-600">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
                            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60"
                            >
                                {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Doctor'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
