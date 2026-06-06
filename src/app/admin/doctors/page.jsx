'use client';
import { useState, useEffect } from 'react';
import { 
    Users, 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Edit, 
    UserX, 
    Key, 
    RefreshCw, 
    ShieldCheck,
    UserCheck,
    Trash2,
    CheckCircle2,
    AlertCircle,
    X,
    ExternalLink,
    MapPin,
    Eye,
    Mail,
    Phone,
    Award,
    DollarSign
} from 'lucide-react';
import apiService from '@/services/api';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

export default function DoctorsManagementPage() {
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';
    const router = useRouter();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');
    const [error, setError] = useState(null);
    const [mutationLoading, setMutationLoading] = useState(null);

    // Modals
    const [createModal, setCreateModal] = useState({ isOpen: false });
    const [detailModal, setDetailModal] = useState({ isOpen: false, doctor: null });
    const [successModal, setSuccessModal] = useState({ isOpen: false, password: '', doctor: null });

    const viewDetails = async (id) => {
        setLoading(true);
        try {
            const res = isAdmin 
                ? await apiService.getAdminUserProfile(id)
                : await apiService.getDoctorViewDoctorById(id);
            const data = await res.json();
            if (res.ok) {
                setDetailModal({ isOpen: true, doctor: { ...data.user, profile: data.profile } });
            }
        } finally { setLoading(false); }
    };
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', specialization: '', 
        qualification: '', experience_years: '', consultation_fee: '',
        address: '', city: '', state: '', pincode: '', bio: ''
    });

    useEffect(() => {
        fetchDoctors();
    }, [filter, isAdmin]);

    const fetchDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = isAdmin 
                ? await apiService.getAdminUsers(filter)
                : await apiService.getDoctorViewDoctors();
            
            if (response.status === 403) {
                setError('You do not have permission to view this page.');
                return;
            }
            
            const result = await response.json();
            if (response.ok) {
                setDoctors(result.users || result.doctors || []);
            } else {
                setError(result.message || 'Failed to fetch doctors');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setMutationLoading('create');
        try {
            const res = await apiService.createAdminUser(formData);
            const result = await res.json();
            if (res.ok) {
                setCreateModal({ isOpen: false });
                setSuccessModal({ isOpen: true, password: result.default_password, doctor: result.user });
                fetchDoctors();
                setFormData({
                    name: '', email: '', phone: '', specialization: '', 
                    qualification: '', experience_years: '', consultation_fee: '',
                    address: '', city: '', state: '', pincode: '', bio: ''
                });
            } else {
                alert(result.message || 'Validation failed');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setMutationLoading(null);
        }
    };

    const handleToggleStatus = async (id) => {
        setMutationLoading(id);
        try {
            const res = await apiService.toggleAdminUser(id);
            if (res.ok) fetchDoctors();
        } finally {
            setMutationLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to deactivate this doctor?')) return;
        setMutationLoading(id);
        try {
            const res = await apiService.deleteAdminUser(id);
            if (res.ok) fetchDoctors();
        } finally {
            setMutationLoading(null);
        }
    };

    const handleDeletePermanent = async (id) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this doctor? This will permanently delete all profile and schedule records. This action cannot be undone.')) return;
        setMutationLoading(id);
        try {
            const res = await apiService.deleteAdminUser(id, true);
            if (res.ok) fetchDoctors();
        } finally {
            setMutationLoading(null);
        }
    };

    const handleRestore = async (id) => {
        setMutationLoading(id);
        try {
            const res = await apiService.restoreAdminUser(id);
            if (res.ok) fetchDoctors();
        } finally {
            setMutationLoading(null);
        }
    };

    const handleResetPassword = async (id) => {
        if (!confirm('Reset password for this doctor?')) return;
        setMutationLoading(id);
        try {
            const res = await apiService.resetAdminUserPassword(id);
            const result = await res.json();
            if (res.ok) {
                setSuccessModal({ isOpen: true, password: result.default_password, doctor: result.user });
            }
        } finally {
            setMutationLoading(null);
        }
    };

    const filteredDoctors = doctors.filter(doc => 
        doc.name.toLowerCase().includes(search.toLowerCase()) || 
        doc.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Doctors</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{isAdmin ? 'Manage medical practitioners and credentials' : 'View our medical team'}</p>
                </div>
                {isAdmin && (
                    <button 
                        onClick={() => setCreateModal({ isOpen: true })}
                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Create Doctor
                    </button>
                )}
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                {isAdmin && (
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full md:w-auto">
                        {['', 'active', 'inactive', 'deleted'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {f || 'All'}
                            </button>
                        ))}
                    </div>
                )}
                <div className={`relative w-full ${isAdmin ? 'md:w-80' : 'md:flex-1'}`}>
                    <input 
                        type="text" 
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-12 text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                </div>
            </div>

            {/* Doctors Table */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor Information</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                                {isAdmin && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>}
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{isAdmin ? 'Actions' : 'Detail'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6 h-20 bg-white/50" />
                                    </tr>
                                ))
                            ) : filteredDoctors.length > 0 ? (
                                filteredDoctors.map((doc) => (
                                    <tr key={doc.id} className={`hover:bg-slate-50/30 transition-colors ${doc.deleted_at ? 'bg-red-50/20' : ''}`}>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black">
                                                    {doc.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-none">{doc.name}</p>
                                                    {isAdmin && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: #{doc.id}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-xs font-bold text-slate-700">{doc.email}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{doc.phone || 'No phone'}</p>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className={`w-fit px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${doc.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                                        {doc.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {doc.deleted_at && (
                                                        <span className="w-fit px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-500 border border-red-100">
                                                            Deleted
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-8 py-5">
                                            <p className="text-xs font-bold text-slate-600">{doc.profile?.specialization || doc.specialization || 'Not set'}</p>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {isAdmin ? (
                                                    <>
                                                        <button 
                                                            onClick={() => viewDetails(doc.id)}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                            title="Edit Profile"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleToggleStatus(doc.id)}
                                                            className={`p-2 rounded-xl transition-all ${doc.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                                            title={doc.is_active ? 'Deactivate' : 'Activate'}
                                                        >
                                                            <ShieldCheck size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleResetPassword(doc.id)}
                                                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                                                            title="Reset Password"
                                                        >
                                                            <Key size={16} />
                                                        </button>
                                                        {doc.deleted_at ? (
                                                            <div className="flex items-center gap-1">
                                                                <button 
                                                                    onClick={() => handleRestore(doc.id)}
                                                                    className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                                                    title="Restore Account"
                                                                >
                                                                    <UserCheck size={16} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeletePermanent(doc.id)}
                                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                                    title="Delete Permanently"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => handleDelete(doc.id)}
                                                                className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                                                                title="Delete Account"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <button 
                                                        onClick={() => viewDetails(doc.id)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400">
                                        <Users size={48} className="mx-auto mb-4 opacity-10" />
                                        <p className="text-sm font-bold uppercase tracking-widest">No doctors found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Doctor Modal */}
            {createModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setCreateModal({ isOpen: false })} />
                    <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Create New Doctor</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Account & Professional Profile</p>
                            </div>
                            <button onClick={() => setCreateModal({ isOpen: false })} className="p-2.5 hover:bg-slate-50 rounded-2xl transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 progress-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Account Info */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Account Info</h3>
                                    <InputField label="Full Name" required value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                                    <InputField label="Email Address" required type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                                    <InputField label="Phone Number" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
                                </div>
                                
                                {/* Professional Info */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Professional Detail</h3>
                                    <InputField label="Specialization" value={formData.specialization} onChange={v => setFormData({...formData, specialization: v})} />
                                    <InputField label="Qualification" value={formData.qualification} onChange={v => setFormData({...formData, qualification: v})} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="Exp. Years" type="number" value={formData.experience_years} onChange={v => setFormData({...formData, experience_years: v})} />
                                        <InputField label="Fee" value={formData.consultation_fee} onChange={v => setFormData({...formData, consultation_fee: v})} />
                                    </div>
                                </div>

                                {/* Address & Bio (Span Full) */}
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Location</h3>
                                        <InputField label="Address" value={formData.address} onChange={v => setFormData({...formData, address: v})} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="City" value={formData.city} onChange={v => setFormData({...formData, city: v})} />
                                            <InputField label="Pincode" value={formData.pincode} onChange={v => setFormData({...formData, pincode: v})} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">Biography</h3>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Bio</label>
                                            <textarea 
                                                rows="4"
                                                value={formData.bio}
                                                onChange={e => setFormData({...formData, bio: e.target.value})}
                                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-8 border-t border-slate-50 flex items-center justify-end gap-4 bg-white sticky bottom-0">
                            <button 
                                type="button"
                                onClick={() => setCreateModal({ isOpen: false })}
                                className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={mutationLoading === 'create'}
                                onClick={handleCreateSubmit}
                                className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                            >
                                {mutationLoading === 'create' ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Password Modal */}
            {successModal.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200" />
                    <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} strokeWidth={3} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Success!</h2>
                        <p className="text-sm font-bold text-slate-400 mt-2">
                            Doctor account for <span className="text-slate-900">{successModal.doctor?.name}</span> has been configured.
                        </p>
                        
                        <div className="mt-8 p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Temporary Password</p>
                            <div className="flex items-center justify-center gap-3">
                                <code className="text-2xl font-black text-blue-600 tracking-widest select-all">{successModal.password}</code>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(successModal.password)}
                                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                    title="Copy Password"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-6">
                            Please share this password securely with the doctor.
                        </p>
                        
                        <button 
                            onClick={() => setSuccessModal({ isOpen: false, password: '', doctor: null })}
                            className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98]"
                        >
                            Understood, Close
                        </button>
                    </div>
                </div>
            )}
            {/* Doctor Detail Modal (Read Only) */}
            {detailModal.isOpen && detailModal.doctor && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDetailModal({ isOpen: false, doctor: null })} />
                    <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-black">
                                    {detailModal.doctor.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{detailModal.doctor.name}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{detailModal.doctor.profile?.specialization || 'General Practitioner'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isAdmin && (
                                    <button 
                                        onClick={() => router.push(`/admin/doctors/${detailModal.doctor.id}/profile`)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                                    >
                                        Edit Full Profile
                                    </button>
                                )}
                                <button onClick={() => setDetailModal({ isOpen: false, doctor: null })} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 progress-scrollbar">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <DetailField label="Email Address" value={detailModal.doctor.email} icon={Mail} />
                                    <DetailField label="Phone Number" value={detailModal.doctor.phone} icon={Phone} />
                                    <DetailField label="Qualification" value={detailModal.doctor.profile?.qualification} icon={Award} />
                                </div>
                                <div className="space-y-4">
                                    <DetailField label="Experience" value={`${detailModal.doctor.profile?.experience_years || 0} Years`} icon={ShieldCheck} />
                                    <DetailField label="Consultation Fee" value={detailModal.doctor.profile?.consultation_fee} icon={DollarSign} />
                                    <DetailField label="License" value={detailModal.doctor.profile?.license_number || 'Verified'} icon={CheckCircle2} />
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biography</h3>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                    "{detailModal.doctor.profile?.bio || 'No professional biography provided.'}"
                                </p>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Location</h3>
                                <div className="p-5 bg-slate-50 rounded-3xl flex items-start gap-4">
                                    <MapPin size={20} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{detailModal.doctor.profile?.address || 'Clinic address not listed'}</p>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5">{detailModal.doctor.profile?.city} {detailModal.doctor.profile?.state} {detailModal.doctor.profile?.pincode}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailField({ label, value, icon: Icon }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="flex items-center gap-3 text-slate-700">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Icon size={16} />
                </div>
                <p className="text-xs font-bold">{value || 'N/A'}</p>
            </div>
        </div>
    );
}

function InputField({ label, type = "text", required = false, value, onChange }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input 
                type={type}
                required={required}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-slate-300"
            />
        </div>
    );
}