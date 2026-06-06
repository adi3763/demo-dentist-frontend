'use client';
import { useState, useEffect } from 'react';
import { 
    Calendar, 
    Filter, 
    CheckCircle2, 
    Clock, 
    Phone, 
    Mail, 
    MessageSquare,
    RefreshCw,
    Search,
    AlertCircle,
    Check,
    X,
    CalendarDays,
    User,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Eye,
    Stethoscope
} from 'lucide-react';
import apiService from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AppointmentsManagementPage() {
    const { user } = useAuth();
    const router = useRouter();
    const isAdmin = user?.role === 'admin';

    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mutationLoading, setMutationLoading] = useState(null);
    
    // Filters
    const [filters, setFilters] = useState({
        date: '',
        status: '',
        doctor_id: '',
        search: '',
        page: 1
    });

    // Detail Modal
    const [detailModal, setDetailModal] = useState({ isOpen: false, appointment: null });

    useEffect(() => {
        if (isAdmin) fetchDoctors();
    }, [isAdmin]);

    useEffect(() => {
        fetchAppointments();
    }, [filters, isAdmin]);

    const fetchDoctors = async () => {
        try {
            const res = await apiService.getAdminUsers('active');
            const data = await res.json();
            if (res.ok) setDoctors(data.users || []);
        } catch (err) { console.error('Failed to fetch doctors', err); }
    };

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use different API based on role
            const response = isAdmin 
                ? await apiService.getAdminAppointments(filters)
                : await apiService.getDoctorAppointments(filters);
            
            if (response.status === 401) {
                router.push('/admin/login');
                return;
            }
            
            const data = await response.json();
            if (response.ok) {
                if (isAdmin) {
                    setAppointments(data.data || []);
                    setPagination({
                        current_page: data.current_page,
                        last_page: data.last_page,
                        total: data.total
                    });
                } else {
                    setAppointments(data.appointments || []);
                    setPagination({ current_page: 1, last_page: 1, total: (data.appointments || []).length });
                }
            } else {
                setError(data.message || 'Failed to load appointments');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        setMutationLoading(id);
        try {
            let res;
            if (isAdmin) {
                let reason = undefined;
                if (status === 'rejected') {
                    reason = prompt('Reason for rejection?');
                    if (reason === null) return; // User cancelled
                } else if (status === 'rescheduled') {
                    reason = prompt('Reason for rescheduling?');
                    if (reason === null) return; // User cancelled
                }
                res = await apiService.updateAdminAppointmentStatus(id, status, reason);
            } else {
                if (status === 'confirmed') res = await apiService.approveAppointment(id);
                else if (status === 'completed') res = await apiService.completeAppointment(id);
                else if (status === 'rejected') {
                    const reason = prompt('Reason for rejection?');
                    if (reason === null) return; // User cancelled
                    res = await apiService.rejectAppointment(id, reason || 'Schedule conflict');
                }
            }
            
            if (res && res.ok) {
                fetchAppointments();
                if (detailModal.isOpen) setDetailModal({ ...detailModal, isOpen: false });
            }
        } finally {
            setMutationLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this appointment record?')) return;
        setMutationLoading(id);
        try {
            const res = await apiService.deleteAdminAppointment(id);
            if (res.ok) fetchAppointments();
        } finally {
            setMutationLoading(null);
        }
    };

    const viewDetails = async (id) => {
        if (!isAdmin) return; // Detail API is admin only for now as per request
        try {
            const res = await apiService.getAdminAppointmentById(id);
            const data = await res.json();
            if (res.ok) {
                setDetailModal({ isOpen: true, appointment: data.appointment });
            }
        } catch (err) { console.error(err); }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}:${minutes} ${ampm}`;
    };

    const formatDate = (dateStr) => {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            case 'rescheduled': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'completed': return 'bg-slate-50 text-slate-500 border-slate-100';
            case 'cancelled': return 'bg-slate-50 text-slate-400 border-slate-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Appointments</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {isAdmin ? 'Global appointment management' : 'Your patient schedule'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => fetchAppointments()}
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <input 
                        type="text" 
                        placeholder="Search patient name or phone..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-12 text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                </div>
                
                <input 
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({...filters, date: e.target.value, page: 1})}
                    className="bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />

                <select 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
                    className="bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none min-w-[140px]"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                {isAdmin && (
                    <select 
                        value={filters.doctor_id}
                        onChange={(e) => setFilters({...filters, doctor_id: e.target.value, page: 1})}
                        className="bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none min-w-[160px]"
                    >
                        <option value="">All Doctors</option>
                        {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                    </select>
                )}

                <button 
                    onClick={() => setFilters({ date: '', status: '', doctor_id: '', search: '', page: 1 })}
                    className="p-3 text-slate-400 hover:text-red-500 transition-colors"
                    title="Clear Filters"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                                {isAdmin && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor</th>}
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => <tr key={i} className="animate-pulse"><td colSpan={isAdmin ? 6 : 5} className="h-20 bg-white/50" /></tr>)
                            ) : appointments.length > 0 ? (
                                appointments.map((appt) => (
                                    <tr key={appt.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-black text-slate-900 leading-none">{appt.patient_name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1">{appt.patient_phone}</p>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-8 py-5">
                                                <p className="text-xs font-bold text-slate-600">{appt.doctor?.name || 'Unassigned'}</p>
                                            </td>
                                        )}
                                        <td className="px-8 py-5">
                                            <p className="text-xs font-bold text-blue-600">{appt.service?.name || 'Dental Visit'}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-xs font-bold text-slate-700">{formatDate(appt.appointment_date)}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{formatTime(appt.start_time)}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(appt.status)}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {isAdmin ? (
                                                    <>
                                                        <button 
                                                            onClick={() => viewDetails(appt.id)}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(appt.id)}
                                                            className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        {appt.status === 'pending' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                                                                    className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase hover:bg-emerald-600 transition-colors"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(appt.id, 'rejected')}
                                                                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase hover:bg-red-600 transition-colors"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {appt.status === 'confirmed' && (
                                                            <button 
                                                                onClick={() => handleUpdateStatus(appt.id, 'completed')}
                                                                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase hover:bg-slate-800 transition-colors"
                                                            >
                                                                Complete
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="py-20 text-center text-slate-400">
                                        <CalendarDays size={48} className="mx-auto mb-4 opacity-10" />
                                        <p className="text-sm font-bold uppercase tracking-widest">No appointments found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Admin only) */}
                {isAdmin && pagination.last_page > 1 && (
                    <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                disabled={filters.page === 1}
                                onClick={() => setFilters({...filters, page: filters.page - 1})}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-40"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button 
                                disabled={filters.page === pagination.last_page}
                                onClick={() => setFilters({...filters, page: filters.page + 1})}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-40"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal (Admin) */}
            {detailModal.isOpen && detailModal.appointment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDetailModal({ isOpen: false, appointment: null })} />
                    <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Appointment Details</h2>
                            <button onClick={() => setDetailModal({ isOpen: false, appointment: null })} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                                <DetailItem label="Patient Name" value={detailModal.appointment.patient_name} icon={User} />
                                <DetailItem label="Phone" value={detailModal.appointment.patient_phone} icon={Phone} />
                                <DetailItem label="Email" value={detailModal.appointment.patient_email || 'Not provided'} icon={Mail} />
                            </div>
                            <div className="space-y-4">
                                <DetailItem label="Doctor" value={detailModal.appointment.doctor?.name} icon={User} />
                                <DetailItem label="Service" value={detailModal.appointment.service?.name} icon={Stethoscope} />
                                <DetailItem label="Time" value={`${formatDate(detailModal.appointment.appointment_date)} at ${formatTime(detailModal.appointment.start_time)}`} icon={Clock} />
                            </div>
                        </div>

                        {detailModal.appointment.patient_notes && (
                            <div className="mb-8 p-6 bg-slate-50 rounded-3xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <MessageSquare size={14} /> Patient Notes
                                </p>
                                <p className="text-sm font-medium text-slate-700">"{detailModal.appointment.patient_notes}"</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Update Status</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {['pending', 'confirmed', 'rejected', 'rescheduled', 'completed', 'cancelled'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => handleUpdateStatus(detailModal.appointment.id, s)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${detailModal.appointment.status === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailItem({ label, value, icon: Icon }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Icon size={16} />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-xs font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}