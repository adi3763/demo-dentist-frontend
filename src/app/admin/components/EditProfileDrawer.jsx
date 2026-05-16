'use client';
import { useState, useEffect } from 'react';
import { X, Camera, Clock, ChevronDown, Plus, Trash2, Calendar, Lock, Unlock, AlertCircle, Edit2 } from 'lucide-react';
import apiService from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function EditProfileDrawer({ isOpen, onClose, user: initialUser }) {
    const { setUser } = useAuth();
    const [isActive, setIsActive] = useState(true);
    const [selectedDay, setSelectedDay] = useState('Tuesday');
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
        available_days: []
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [photoLoading, setPhotoLoading] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [blockedDates, setBlockedDates] = useState([]);
    const [isUsingDefault, setIsUsingDefault] = useState(true);
    const [defaultInfo, setDefaultInfo] = useState(null);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    
    // New Blocked Date State
    const [newBlocked, setNewBlocked] = useState({
        blocked_date: '',
        reason: ''
    });
    const [mutationLoading, setMutationLoading] = useState(false);
    
    // Schedule Slot Editing State
    const [editingSlotId, setEditingSlotId] = useState(null);
    const [editSlotForm, setEditSlotForm] = useState({
        day_of_week: 0,
        start_time: '',
        end_time: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
            fetchSchedule();
        }
    }, [isOpen]);

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
                    available_days: data.profile?.available_days || [],
                });
            } else {
                setStatus({ type: 'error', message: data.message || 'Failed to load profile data. Please check if the API is implemented.' });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setStatus({ type: 'error', message: 'Network error: Could not reach the profile API.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedule = async () => {
        setScheduleLoading(true);
        try {
            const response = await apiService.getDoctorSchedule();
            const data = await response.json();
            if (response.ok) {
                setSchedules(data.schedule || []);
                setBlockedDates(data.blocked_dates || []);
                setIsUsingDefault(data.using_default_schedule);
                setDefaultInfo(data.default_schedule);
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setScheduleLoading(false);
        }
    };

    const handleCustomize = async () => {
        setMutationLoading(true);
        try {
            const res = await apiService.saveDefaultSchedule();
            if (res.ok) fetchSchedule();
        } catch (error) {
            console.error('Error customizing schedule:', error);
        } finally {
            setMutationLoading(false);
        }
    };

    const handleToggleSlot = async (id) => {
        if (!id) return;
        try {
            const res = await apiService.toggleScheduleSlot(id);
            if (res.ok) fetchSchedule();
        } catch (error) {
            console.error('Error toggling slot:', error);
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!id) return;
        if (!confirm('Are you sure you want to delete this time slot?')) return;
        try {
            const res = await apiService.deleteScheduleSlot(id);
            if (res.ok) fetchSchedule();
        } catch (error) {
            console.error('Error deleting slot:', error);
        }
    };

    const handleAddBlockedDate = async (e) => {
        e.preventDefault();
        if (!newBlocked.blocked_date) return;
        setMutationLoading(true);
        try {
            const res = await apiService.addBlockedDate(newBlocked);
            if (res.ok) {
                setNewBlocked({ blocked_date: '', reason: '' });
                fetchSchedule();
            }
        } catch (error) {
            console.error('Error adding blocked date:', error);
        } finally {
            setMutationLoading(false);
        }
    };

    const handleDeleteBlockedDate = async (id) => {
        try {
            const res = await apiService.deleteBlockedDate(id);
            if (res.ok) fetchSchedule();
        } catch (error) {
            console.error('Error deleting blocked date:', error);
        }
    };

    const handleStartEdit = (slot) => {
        setEditingSlotId(slot.id);
        setEditSlotForm({
            day_of_week: slot.day_of_week,
            start_time: slot.start_time.substring(0, 5),
            end_time: slot.end_time.substring(0, 5)
        });
    };

    const handleUpdateSlot = async (e) => {
        e.preventDefault();
        setMutationLoading(true);
        setStatus({ type: '', message: '' });
        try {
            const response = await apiService.updateScheduleSlot(editingSlotId, editSlotForm);
            const data = await response.json();
            if (response.ok) {
                setEditingSlotId(null);
                fetchSchedule();
                setStatus({ type: 'success', message: 'Slot updated successfully!' });
            } else {
                setStatus({ type: 'error', message: data.message || 'Failed to update slot' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Error updating slot' });
        } finally {
            setMutationLoading(false);
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}:${minutes} ${ampm}`;
    };

    const getDayName = (dayNum) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayNum];
    };

    const handlePhotoClick = () => {
        document.getElementById('photo-input').click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            setStatus({ type: 'error', message: 'Please select an image file.' });
            return;
        }

        const formData = new FormData();
        formData.append('photo', file);

        setPhotoLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await apiService.uploadDoctorPhoto(formData);
            const data = await response.json();
            
            if (response.ok) {
                setProfileData(prev => ({ ...prev, photo: data.photo_url }));
                // Update global user state for header sync
                setUser(prev => ({
                    ...prev,
                    profile: {
                        ...(prev?.profile || {}),
                        photo: data.photo_url
                    }
                }));
                setStatus({ type: 'success', message: 'Photo uploaded successfully!' });
            } else {
                setStatus({ type: 'error', message: data.message || 'Failed to upload photo' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Error uploading photo' });
        } finally {
            setPhotoLoading(false);
        }
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        setScheduleLoading(true);
        
        // Calculate day of week as an integer (0-6, where 0 is Sunday)
        const dateObj = new Date(newSchedule.date);
        const dayOfWeek = dateObj.getDay(); 

        try {
            const response = await apiService.addDoctorSchedule({
                ...newSchedule,
                day_of_week: dayOfWeek
            });
            const data = await response.json();
            if (response.ok) {
                setSchedules(prev => [...prev, data.schedule]);
                setIsAddingSchedule(false);
                setNewSchedule({ date: '', start_time: '09:00', end_time: '09:30' });
                setStatus({ type: 'success', message: 'Schedule added successfully!' });
            } else {
                setStatus({ type: 'error', message: data.message || 'Failed to add schedule' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Error adding schedule' });
        } finally {
            setScheduleLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            const patchData = {
                specialization: profileData.specialization,
                bio: profileData.bio,
                experience_years: parseInt(profileData.experience_years),
                consultation_fee: profileData.consultation_fee,
                available_days: profileData.available_days,
            };
            const response = await apiService.updateDoctorProfile(patchData);
            const data = await response.json();
            if (response.ok) {
                setStatus({ type: 'success', message: 'Profile updated successfully!' });
                
                // Update global user state for header sync
                setUser(prev => ({
                    ...prev,
                    profile: {
                        ...(prev?.profile || {}),
                        ...patchData
                    }
                }));

                setTimeout(() => {
                    onClose();
                    setStatus({ type: '', message: '' });
                }, 2000);
            } else {
                setStatus({ type: 'error', message: data.message || 'Failed to update profile' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className={`fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-[110] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Profile Sidebar Panel */}
            <div className={`fixed inset-y-0 right-0 w-full sm:max-w-[540px] bg-white shadow-[-10px_0_40px_rgba(15,23,42,0.08)] z-[120] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>

                {/* Header Section */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Profile</h2>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Manage your professional information and clinical availability</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {status.type === 'error' && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-sm font-bold text-red-600">
                            {status.message.toLowerCase().includes('update') || status.message.toLowerCase().includes('field') ? 'Error Updating Profile' : 'Error Loading Profile'}
                        </p>
                        <p className="text-xs text-red-500 mt-1">{status.message}</p>
                        <button 
                            onClick={fetchProfile}
                            className="mt-3 text-xs font-black text-red-600 uppercase tracking-widest hover:underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 progress-scrollbar relative">
                    {loading && !profileData.name && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">Fetching Profile...</p>
                            </div>
                        </div>
                    )}

                    {/* Row 1: Photo & Top Inputs Grid */}
                    <div className="flex flex-col sm:grid sm:grid-cols-12 gap-6">
                        {/* Left Column: Photo Upload Uploader */}
                        <div className="sm:col-span-4 flex flex-col items-center justify-start pt-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 w-full text-left">Photo</label>
                            <input 
                                type="file" 
                                id="photo-input" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handlePhotoChange} 
                            />
                            <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                                <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center relative overflow-hidden shadow-sm">
                                    {photoLoading ? (
                                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                        </div>
                                    ) : null}
                                    
                                    {profileData.photo ? (
                                        <img 
                                            src={profileData.photo.startsWith('http') ? profileData.photo : `https://demo-dentist-main-adaeep.free.laravel.cloud/storage/${profileData.photo}`} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Camera size={28} className="text-slate-400" />
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                                    <Camera size={14} strokeWidth={3} />
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 text-center mt-3 font-medium leading-tight">Click to change photo</p>
                        </div>

                        {/* Right Column: Name & Specialization */}
                        <div className="sm:col-span-8 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    disabled
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Specialization</label>
                                <div className="relative">
                                    <select 
                                        name="specialization"
                                        value={profileData.specialization}
                                        onChange={handleInputChange}
                                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-800 appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    >
                                        <option value="Dentist">Dentist</option>
                                        <option value="Pediatric Dentist">Pediatric Dentist</option>
                                        <option value="Cardiology">Cardiology</option>
                                        <option value="Neurology">Neurology</option>
                                        <option value="Orthopedics">Orthopedics</option>
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row: Experience & Fee */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Experience (Years)</label>
                            <input
                                type="number"
                                name="experience_years"
                                value={profileData.experience_years}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Consultation Fee</label>
                            <input
                                type="text"
                                name="consultation_fee"
                                value={profileData.consultation_fee}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Row: Bio */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Bio</label>
                        <textarea
                            name="bio"
                            value={profileData.bio}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                            placeholder="Tell patients about yourself..."
                        />
                    </div>

                    {/* Row 2: Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                disabled
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={profileData.phone}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                disabled
                            />
                        </div>
                    </div>

                    {/* Row 3: License & Status Toggle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">License Number</label>
                            <input
                                type="text"
                                name="license_number"
                                value={profileData.license_number}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5 pt-6 pl-2">
                            <label className="text-xs font-semibold text-slate-700 block mb-2">Status</label>
                            <div className="flex items-center gap-3">
                                {/* Switch Container */}
                                <button
                                    type="button"
                                    onClick={() => setIsActive(!isActive)}
                                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 outline-none ${isActive ? 'bg-blue-600' : 'bg-slate-200'
                                        }`}
                                >
                                    {/* Switch Handle */}
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${isActive ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                </button>
                                <span className="text-sm font-semibold text-slate-700">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* --- SCHEDULE SECTION --- */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Clinical Schedule</h3>
                            </div>
                        </div>

                        {scheduleLoading ? (
                            <div className="space-y-3">
                                <div className="h-32 bg-slate-50 rounded-[28px] animate-pulse border border-slate-100" />
                                <div className="h-20 bg-slate-50 rounded-[28px] animate-pulse border border-slate-100" />
                            </div>
                        ) : isUsingDefault ? (
                            /* DEFAULT SCHEDULE VIEW */
                            <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-[32px] space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <Clock className="text-blue-600" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">Regular Clinic Schedule</h4>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                                            {defaultInfo?.days || 'Monday to Saturday'} <br />
                                            {defaultInfo?.hours || '09:00 AM - 05:00 PM'} • {defaultInfo?.slot_minutes || 30} min slots
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCustomize}
                                        disabled={mutationLoading}
                                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {mutationLoading ? 'Processing...' : 'Customize Schedule'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* CUSTOM SCHEDULE VIEW */
                            <div className="space-y-6">
                                {[1, 2, 3, 4, 5, 6, 0].map(dayNum => {
                                    const daySlots = schedules.filter(s => s.day_of_week === dayNum);
                                    if (daySlots.length === 0) return null;

                                    return (
                                        <div key={dayNum} className="space-y-3">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{getDayName(dayNum)}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {daySlots.map(slot => (
                                                    <div key={slot.id} className="p-4 bg-white border border-slate-100 rounded-[24px] shadow-sm group hover:border-blue-100 transition-all">
                                                        {editingSlotId === slot.id ? (
                                                            /* INLINE EDIT FORM */
                                                            <form onSubmit={handleUpdateSlot} className="space-y-3">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="space-y-1 col-span-2">
                                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Day of Week</label>
                                                                        <select
                                                                            value={editSlotForm.day_of_week}
                                                                            onChange={e => setEditSlotForm(prev => ({ ...prev, day_of_week: parseInt(e.target.value) }))}
                                                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                                                                        >
                                                                            {[0, 1, 2, 3, 4, 5, 6].map(d => (
                                                                                <option key={d} value={d}>{getDayName(d)}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Start</label>
                                                                        <input
                                                                            type="time"
                                                                            value={editSlotForm.start_time}
                                                                            onChange={e => setEditSlotForm(prev => ({ ...prev, start_time: e.target.value }))}
                                                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">End</label>
                                                                        <input
                                                                            type="time"
                                                                            value={editSlotForm.end_time}
                                                                            onChange={e => setEditSlotForm(prev => ({ ...prev, end_time: e.target.value }))}
                                                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 pt-1">
                                                                    <button
                                                                        type="submit"
                                                                        disabled={mutationLoading}
                                                                        className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all"
                                                                    >
                                                                        {mutationLoading ? '...' : 'Save'}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditingSlotId(null)}
                                                                        className="flex-1 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            /* SLOT VIEW MODE */
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-2 h-2 rounded-full ${slot.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                                    <span className="text-xs font-bold text-slate-700">{formatTime(slot.start_time)} — {formatTime(slot.end_time)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleStartEdit(slot)}
                                                                        title="Edit slot"
                                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleToggleSlot(slot.id)}
                                                                        title={slot.is_active ? 'Disable slot' : 'Enable slot'}
                                                                        className={`p-2 rounded-lg transition-colors ${slot.is_active ? 'text-slate-400 hover:bg-slate-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                                                                    >
                                                                        {slot.is_active ? <Lock size={14} /> : <Unlock size={14} />}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteSlot(slot.id)}
                                                                        title="Delete slot"
                                                                        className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* --- BLOCKED DATES SECTION --- */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Leave & Blocked Dates</h3>
                        </div>

                        {/* Blocked Dates List */}
                        <div className="space-y-2">
                            {blockedDates.length > 0 ? (
                                blockedDates.map(bd => (
                                    <div key={bd.id} className="flex items-center justify-between p-4 bg-red-50/30 border border-red-100/50 rounded-[24px]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-xl bg-white border border-red-100 flex items-center justify-center text-red-500 shadow-sm">
                                                <Calendar size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{new Date(bd.blocked_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                {bd.reason && <p className="text-[10px] font-medium text-slate-500 mt-0.5">{bd.reason}</p>}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteBlockedDate(bd.id)}
                                            className="p-2 text-red-400 hover:bg-white hover:text-red-600 rounded-xl transition-all shadow-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No blocked dates scheduled</p>
                                </div>
                            )}
                        </div>

                        {/* Add Blocked Date Form */}
                        <form onSubmit={handleAddBlockedDate} className="p-5 bg-white border border-slate-200 rounded-[28px] shadow-sm space-y-4 mt-4">
                            <h4 className="text-xs font-bold text-slate-800 px-1 flex items-center gap-2">
                                <AlertCircle size={14} className="text-blue-500" />
                                Add Leave/Blocked Date
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newBlocked.blocked_date}
                                        onChange={e => setNewBlocked(prev => ({ ...prev, blocked_date: e.target.value }))}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Conference, Personal"
                                        value={newBlocked.reason}
                                        onChange={e => setNewBlocked(prev => ({ ...prev, reason: e.target.value }))}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={mutationLoading}
                                className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {mutationLoading ? 'Processing...' : 'Block Selected Date'}
                            </button>
                        </form>
                    </div>

                </div>

                {/* Action Button Footer */}
                <div className="p-5 border-t border-slate-100 flex flex-col sm:grid sm:grid-cols-2 gap-3 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : 'Save Profile Changes'}
                    </button>
                    {status.message && (
                        <div className={`sm:col-span-2 text-center text-xs font-bold py-2 rounded-lg ${status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {status.message}
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}