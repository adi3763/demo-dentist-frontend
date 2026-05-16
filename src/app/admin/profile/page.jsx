'use client';
import { useState, useEffect } from 'react';
import { Camera, User, Mail, Phone, Stethoscope, Briefcase, DollarSign, Award, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import apiService, { getStorageUrl } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function DoctorProfilePage() {
    const { setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [photoLoading, setPhotoLoading] = useState(false);
    const [imgError, setImgError] = useState(false);
    
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        bio: '',
        experience_years: '',
        consultation_fee: '',
        license_number: '',
        photo: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        setImgError(false);
    }, [profileData.photo]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await apiService.getDoctorProfile();
            const data = await response.json();
            if (response.ok) {
                setProfileData({
                    name: data.user?.name || '',
                    email: data.user?.email || '',
                    phone: data.user?.phone || '',
                    specialization: data.profile?.specialization || '',
                    bio: data.profile?.bio || '',
                    experience_years: data.profile?.experience_years || '',
                    consultation_fee: data.profile?.consultation_fee || '',
                    license_number: data.profile?.license_number || 'MD-987654321',
                    photo: data.profile?.photo || '',
                });
            } else {
                setStatus({ type: 'error', message: data.message || 'Failed to load profile' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Connection error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatus({ type: '', message: '' });
        try {
            const patchData = {
                specialization: profileData.specialization,
                bio: profileData.bio,
                experience_years: parseInt(profileData.experience_years),
                consultation_fee: profileData.consultation_fee,
            };
            const response = await apiService.updateDoctorProfile(patchData);
            const data = await response.json();
            if (response.ok) {
                setStatus({ type: 'success', message: 'Profile updated successfully!' });
                setUser(prev => ({ ...prev, profile: { ...(prev?.profile || {}), ...patchData } }));
                setTimeout(() => setStatus({ type: '', message: '' }), 3000);
            } else {
                setStatus({ type: 'error', message: data.message || 'Update failed' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An error occurred' });
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('photo', file);
        setPhotoLoading(true);
        try {
            const response = await apiService.uploadDoctorPhoto(formData);
            const data = await response.json();
            if (response.ok) {
                const newPhoto = data.profile?.photo || data.photo;
                setProfileData(prev => ({ ...prev, photo: newPhoto }));
                setUser(prev => ({ ...prev, profile: { ...(prev?.profile || {}), photo: newPhoto } }));
                setStatus({ type: 'success', message: 'Photo updated!' });
            }
        } catch (error) { console.error(error); }
        finally { setPhotoLoading(false); }
    };

    if (loading) return <div className="p-10 animate-pulse space-y-8"><div className="h-10 w-48 bg-slate-200 rounded-xl" /><div className="h-96 bg-white rounded-[40px]" /></div>;

    const photoUrl = getStorageUrl(profileData.photo);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Profile</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage your professional identity</p>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                    <div className="absolute -bottom-12 left-10">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[32px] bg-white p-1 shadow-xl">
                                <div className="w-full h-full rounded-[28px] bg-slate-100 overflow-hidden relative">
                                    {(photoUrl && !imgError) ? (
                                        <img 
                                            src={photoUrl} 
                                            className="w-full h-full object-cover"
                                            alt="Profile"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : <User className="w-full h-full p-6 text-slate-300" />}
                                    {photoLoading && <div className="absolute inset-0 bg-white/40 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}
                                </div>
                            </div>
                            <button 
                                onClick={() => document.getElementById('photo-upload').click()}
                                className="absolute bottom-2 right-2 p-2 bg-white text-blue-600 rounded-xl shadow-lg border border-slate-100 hover:scale-110 transition-transform"
                            >
                                <Camera size={16} strokeWidth={3} />
                            </button>
                            <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="pt-20 px-10 pb-10 space-y-10">
                    {status.message && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            {status.message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Side: Account Info */}
                        <div className="space-y-6">
                            <SectionHeader icon={User} title="Account Information" />
                            <div className="space-y-4">
                                <ReadOnlyField label="Full Name" value={profileData.name} />
                                <ReadOnlyField label="Email Address" value={profileData.email} icon={Mail} />
                                <ReadOnlyField label="Phone Number" value={profileData.phone} icon={Phone} />
                            </div>
                        </div>

                        {/* Right Side: Professional Info */}
                        <div className="space-y-6">
                            <SectionHeader icon={Stethoscope} title="Professional Detail" />
                            <div className="space-y-4">
                                <EditableField 
                                    label="Specialization" 
                                    value={profileData.specialization} 
                                    onChange={v => setProfileData({...profileData, specialization: v})} 
                                    type="select"
                                    options={['Dentist', 'Pediatric Dentist', 'Cardiology', 'Neurology', 'Orthopedics']}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <EditableField 
                                        label="Experience (Years)" 
                                        value={profileData.experience_years} 
                                        onChange={v => setProfileData({...profileData, experience_years: v})} 
                                        type="number"
                                    />
                                    <EditableField 
                                        label="Consultation Fee" 
                                        value={profileData.consultation_fee} 
                                        onChange={v => setProfileData({...profileData, consultation_fee: v})} 
                                    />
                                </div>
                                <ReadOnlyField label="License Number" value={profileData.license_number} icon={Award} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-50">
                        <SectionHeader icon={Briefcase} title="Biography" />
                        <textarea 
                            rows="4"
                            value={profileData.bio}
                            onChange={e => setProfileData({...profileData, bio: e.target.value})}
                            placeholder="Write about your professional journey..."
                            className="w-full bg-slate-50 border-none rounded-[28px] p-6 text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all resize-none outline-none"
                        />
                    </div>

                    <div className="pt-6 flex justify-end">
                        <button 
                            type="submit"
                            disabled={saving}
                            className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center gap-3"
                        >
                            {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                            Save Profile Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SectionHeader({ icon: Icon, title }) {
    return (
        <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Icon size={18} />
            </div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h3>
        </div>
    );
}

function ReadOnlyField({ label, value, icon: Icon }) {
    return (
        <div className="space-y-1.5 opacity-70">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="w-full bg-slate-50 rounded-2xl py-3 px-4 text-sm font-bold text-slate-500 border border-slate-100 flex items-center gap-3">
                {Icon && <Icon size={14} className="text-slate-300" />}
                {value || 'Not set'}
            </div>
        </div>
    );
}

function EditableField({ label, value, onChange, type = "text", options = [] }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            {type === 'select' ? (
                <select 
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input 
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
            )}
        </div>
    );
}
