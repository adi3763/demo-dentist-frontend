'use client';
import { X, Phone, Mail, MapPin, Stethoscope, GraduationCap, Clock, DollarSign, Globe, CalendarDays } from 'lucide-react';

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DoctorDetailModal({ doctor, isOpen, onClose, isAdmin, onToggleStatus, toggling }) {
    if (!isOpen || !doctor) return null;

    const p = doctor.profile || {};
    const isActive = doctor.is_active ?? (doctor.status === 'active' || doctor.status === 'Active');

    const avatarUrl = p.photo ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'D')}&background=0D8ABC&color=fff&size=128`;

    const availableDays = Array.isArray(p.available_days) ? p.available_days : [];
    const languages = Array.isArray(p.languages) ? p.languages : [];

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full sm:max-w-lg bg-white sm:rounded-[32px] rounded-t-[32px] shadow-2xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">

                {/* Dark Header */}
                <div className="relative bg-gradient-to-br from-slate-800 to-[#1a2b4b] sm:rounded-t-[32px] rounded-t-[32px] px-6 pt-8 pb-5 flex-shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/70 transition-all">
                        <X size={16} />
                    </button>

                    <div className="flex items-center gap-4">
                        <img src={avatarUrl} alt={doctor.name}
                            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/10 shadow-lg flex-shrink-0"
                            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0D8ABC&color=fff`; }}
                        />
                        <div className="min-w-0">
                            <h2 className="text-lg font-black text-white truncate">{doctor.name}</h2>
                            <p className="text-sm text-blue-300 font-medium">{p.specialization || 'General'}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{p.qualification || ''}</p>
                            {/* Active badge */}
                            <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                {isActive ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                    </div>

                    {/* Admin Toggle */}
                    {isAdmin && (
                        <div className="mt-4 flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3">
                            <div>
                                <p className="text-xs font-black text-white/80 uppercase tracking-wider">Toggle Status</p>
                                <p className="text-[10px] text-white/40 mt-0.5">
                                    {isActive ? 'Receiving appointments' : 'Currently inactive'}
                                </p>
                            </div>
                            <button
                                onClick={() => onToggleStatus(doctor)}
                                disabled={toggling === doctor.id}
                                className={`relative w-12 h-6 rounded-full transition-all duration-300 disabled:opacity-50 ${isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}
                            >
                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${isActive ? 'left-6' : 'left-0.5'}`} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Contact */}
                    <section>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Contact</p>
                        <div className="grid grid-cols-1 gap-3">
                            {doctor.email && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <Mail size={15} className="text-blue-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                                        <p className="text-sm font-semibold text-slate-800">{doctor.email}</p>
                                    </div>
                                </div>
                            )}
                            {doctor.phone && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <Phone size={15} className="text-emerald-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                                        <p className="text-sm font-semibold text-slate-800">{doctor.phone}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Professional */}
                    {(p.experience_years || p.consultation_fee) && (
                        <section>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Professional</p>
                            <div className="grid grid-cols-2 gap-3">
                                {p.experience_years && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                        <Clock size={15} className="text-amber-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Experience</p>
                                            <p className="text-sm font-semibold text-slate-800">{p.experience_years} yrs</p>
                                        </div>
                                    </div>
                                )}
                                {p.consultation_fee && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                        <Stethoscope size={15} className="text-green-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Fee</p>
                                            <p className="text-sm font-semibold text-slate-800">₹{p.consultation_fee}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Location */}
                    {(p.city || p.state) && (
                        <section>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Location</p>
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                <MapPin size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    {p.address && <p className="text-sm font-semibold text-slate-800">{p.address}</p>}
                                    <p className="text-xs text-slate-500">{[p.city, p.state, p.pincode].filter(Boolean).join(', ')}</p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Available Days */}
                    {availableDays.length > 0 && (
                        <section>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <CalendarDays size={12} /> Available Days
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                {DAY_ORDER.map(day => {
                                    const active = availableDays.includes(day);
                                    return (
                                        <span key={day} className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            {day}
                                        </span>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Languages */}
                    {languages.length > 0 && (
                        <section>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Globe size={12} /> Languages
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                {languages.map(lang => (
                                    <span key={lang} className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-emerald-50 text-emerald-600">
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Bio */}
                    {p.bio && (
                        <section>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">About</p>
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4">{p.bio}</p>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
                    <button onClick={onClose} className="w-full py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
