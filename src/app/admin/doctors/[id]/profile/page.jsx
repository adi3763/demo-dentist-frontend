'use client';
import { useState, useEffect, use } from 'react';
import { 
    ChevronLeft, 
    Save, 
    User, 
    Stethoscope, 
    MapPin, 
    Briefcase, 
    Languages, 
    Clock, 
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import apiService from '@/services/api';
import { useRouter } from 'next/navigation';

export default function AdminDoctorProfilePage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const id = params.id;
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        specialization: '',
        qualification: '',
        experience_years: '',
        consultation_fee: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        bio: '',
        languages: [],
        available_days: []
    });
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await apiService.getAdminUserProfile(id);
            const data = await res.json();
            if (res.ok) {
                setUserEmail(data.user.email);
                setFormData({
                    name: data.user.name || '',
                    phone: data.user.phone || '',
                    specialization: data.profile?.specialization || '',
                    qualification: data.profile?.qualification || '',
                    experience_years: data.profile?.experience_years || '',
                    consultation_fee: data.profile?.consultation_fee || '',
                    address: data.profile?.address || '',
                    city: data.profile?.city || '',
                    state: data.profile?.state || '',
                    pincode: data.profile?.pincode || '',
                    bio: data.profile?.bio || '',
                    languages: data.profile?.languages || [],
                    available_days: data.profile?.available_days || []
                });
            } else {
                setError(data.message || 'Failed to load profile');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            const res = await apiService.updateAdminUserProfile(id, {
                ...formData,
                experience_years: parseInt(formData.experience_years) || 0
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                const data = await res.json();
                setError(data.message || 'Update failed');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
                <div className="h-10 w-48 bg-slate-200 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white rounded-[40px] border border-slate-100" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header & Back */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} strokeWidth={3} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Doctor Profile</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Managing {formData.name}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {success && (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-right-2">
                            <CheckCircle2 size={16} />
                            Changes Saved
                        </div>
                    )}
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                        Save Profile
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Section: Account & Basic Info */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                    <SectionTitle icon={User} title="Basic Information" color="blue" />
                    <div className="space-y-4">
                        <InputField label="Email (Read Only)" value={userEmail} disabled />
                        <InputField label="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                        <InputField label="Phone Number" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
                    </div>
                </div>

                {/* Section: Professional Detail */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                    <SectionTitle icon={Stethoscope} title="Medical Credentials" color="emerald" />
                    <div className="space-y-4">
                        <InputField label="Specialization" value={formData.specialization} onChange={v => setFormData({...formData, specialization: v})} />
                        <InputField label="Qualification" value={formData.qualification} onChange={v => setFormData({...formData, qualification: v})} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Exp. Years" type="number" value={formData.experience_years} onChange={v => setFormData({...formData, experience_years: v})} />
                            <InputField label="Consultation Fee" value={formData.consultation_fee} onChange={v => setFormData({...formData, consultation_fee: v})} />
                        </div>
                    </div>
                </div>

                {/* Section: Location */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                    <SectionTitle icon={MapPin} title="Clinical Location" color="amber" />
                    <div className="space-y-4">
                        <InputField label="Address" value={formData.address} onChange={v => setFormData({...formData, address: v})} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="City" value={formData.city} onChange={v => setFormData({...formData, city: v})} />
                            <InputField label="State" value={formData.state} onChange={v => setFormData({...formData, state: v})} />
                        </div>
                        <InputField label="Pincode" value={formData.pincode} onChange={v => setFormData({...formData, pincode: v})} />
                    </div>
                </div>

                {/* Section: Bio & Skills */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                    <SectionTitle icon={Briefcase} title="Profile Biography" color="purple" />
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">About Doctor</label>
                            <textarea 
                                rows="8"
                                value={formData.bio}
                                onChange={e => setFormData({...formData, bio: e.target.value})}
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                                placeholder="Write professional bio..."
                            />
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
}

function SectionTitle({ icon: Icon, title, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-purple-600'
    };
    return (
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colors[color]}`}>
                <Icon size={20} />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{title}</h3>
        </div>
    );
}

function InputField({ label, type = "text", value, onChange, disabled = false }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input 
                type={type}
                disabled={disabled}
                value={value}
                onChange={e => onChange?.(e.target.value)}
                className={`w-full border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none transition-all ${disabled ? 'bg-slate-50 opacity-60' : 'bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100'}`}
            />
        </div>
    );
}
