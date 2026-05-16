'use client';
import { useState, useEffect } from 'react';
import { X, Camera, Clock, ChevronDown, Plus } from 'lucide-react';
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
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [isAddingSchedule, setIsAddingSchedule] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        date: '',
        start_time: '09:00',
        end_time: '09:30'
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
                setSchedules(data.schedules || []);
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setScheduleLoading(false);
        }
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

                    {/* Real Availability Schedule Section from API */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Upcoming Schedule</h3>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsAddingSchedule(!isAddingSchedule)}
                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-100 transition-all flex items-center gap-1.5"
                            >
                                {isAddingSchedule ? <X size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
                                {isAddingSchedule ? 'Cancel' : 'Add Slot'}
                            </button>
                        </div>

                        {/* Add Schedule Form */}
                        {isAddingSchedule && (
                            <form onSubmit={handleAddSchedule} className="p-5 bg-blue-50/50 border border-blue-100 rounded-[24px] space-y-4 animate-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                        <input 
                                            type="date" 
                                            required
                                            value={newSchedule.date}
                                            onChange={e => setNewSchedule(prev => ({...prev, date: e.target.value}))}
                                            className="w-full bg-white border border-blue-200/50 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                                        <input 
                                            type="time" 
                                            required
                                            value={newSchedule.start_time}
                                            onChange={e => setNewSchedule(prev => ({...prev, start_time: e.target.value}))}
                                            className="w-full bg-white border border-blue-200/50 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                                        <input 
                                            type="time" 
                                            required
                                            value={newSchedule.end_time}
                                            onChange={e => setNewSchedule(prev => ({...prev, end_time: e.target.value}))}
                                            className="w-full bg-white border border-blue-200/50 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={scheduleLoading}
                                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {scheduleLoading ? 'Saving...' : 'Confirm Slot'}
                                </button>
                            </form>
                        )}

                        {scheduleLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                                ))}
                            </div>
                        ) : schedules.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {schedules.map((slot) => (
                                    <div key={slot.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-all group relative overflow-hidden">
                                        {/* Status indicator */}
                                        <div className={`absolute top-0 left-0 w-1 h-full ${slot.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                {!slot.is_active && <span className="text-red-500 font-black">(Disabled)</span>}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock size={14} className="text-emerald-500" />
                                                <p className="text-sm font-black text-slate-800">
                                                    {slot.start_time.substring(0, 5)} — {slot.end_time.substring(0, 5)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No scheduled slots available</p>
                                <p className="text-[10px] text-slate-400 mt-1">Please contact admin to add time slots</p>
                            </div>
                        )}
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
                        className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-sm active:scale-[0.98] transition-all disabled:opacity-70"
                    >
                        {loading ? 'Saving...' : 'Save Profile'}
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