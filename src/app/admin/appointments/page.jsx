'use client';
import { useState, useEffect } from 'react';
import { 
    Calendar, 
    Filter, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    MoreHorizontal, 
    Phone, 
    Mail, 
    MessageSquare,
    ChevronRight,
    RefreshCw,
    Search,
    AlertCircle,
    Check,
    X,
    CalendarDays
} from 'lucide-react';
import apiService from '@/services/api';
import { useRouter } from 'next/navigation';

export default function DoctorAppointmentsPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [error, setError] = useState(null);
    const [mutationLoading, setMutationLoading] = useState(null); // stores ID of appointment being processed
    
    // Modals state
    const [rejectModal, setRejectModal] = useState({ isOpen: false, appointmentId: null, reason: '' });
    const [rescheduleModal, setRescheduleModal] = useState({ 
        isOpen: false, 
        appointmentId: null, 
        new_date: '', 
        new_time: '', 
        reason: '' 
    });

    useEffect(() => {
        fetchAppointments();
    }, [statusFilter, dateFilter]);

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = {};
            if (statusFilter) filters.status = statusFilter;
            if (dateFilter) filters.date = dateFilter;
            
            const response = await apiService.getDoctorAppointments(filters);
            if (response.status === 401) {
                router.push('/login');
                return;
            }
            const data = await response.json();
            if (response.ok) {
                setAppointments(data.appointments || []);
            } else {
                setError(data.message || 'Failed to load appointments');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        setMutationLoading(id);
        try {
            const res = await apiService.approveAppointment(id);
            if (res.ok) {
                fetchAppointments();
            }
        } catch (err) {
            console.error('Approval failed:', err);
        } finally {
            setMutationLoading(null);
        }
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        setMutationLoading(rejectModal.appointmentId);
        try {
            const res = await apiService.rejectAppointment(rejectModal.appointmentId, rejectModal.reason);
            if (res.ok) {
                setRejectModal({ isOpen: false, appointmentId: null, reason: '' });
                fetchAppointments();
            }
        } catch (err) {
            console.error('Rejection failed:', err);
        } finally {
            setMutationLoading(null);
        }
    };

    const handleRescheduleSubmit = async (e) => {
        e.preventDefault();
        setMutationLoading(rescheduleModal.appointmentId);
        try {
            const res = await apiService.rescheduleAppointment(rescheduleModal.appointmentId, {
                new_date: rescheduleModal.new_date,
                new_time: rescheduleModal.new_time,
                reason: rescheduleModal.reason
            });
            const data = await res.json();
            if (res.ok) {
                setRescheduleModal({ isOpen: false, appointmentId: null, new_date: '', new_time: '', reason: '' });
                fetchAppointments();
            } else if (res.status === 409) {
                alert(data.message || 'The new time slot is already booked.');
            }
        } catch (err) {
            console.error('Reschedule failed:', err);
        } finally {
            setMutationLoading(null);
        }
    };

    const handleComplete = async (id) => {
        if (!confirm('Mark this appointment as completed?')) return;
        setMutationLoading(id);
        try {
            const res = await apiService.completeAppointment(id);
            if (res.ok) {
                fetchAppointments();
            }
        } catch (err) {
            console.error('Completion failed:', err);
        } finally {
            setMutationLoading(null);
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
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Appointments</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage patient visits and availability</p>
                </div>
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <input 
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="relative">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all shadow-sm appearance-none pr-10 min-w-[140px]"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="rescheduled">Rescheduled</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    {(dateFilter || statusFilter) && (
                        <button 
                            onClick={() => { setDateFilter(''); setStatusFilter(''); }}
                            className="p-2.5 bg-slate-200 hover:bg-slate-300 rounded-xl transition-all text-slate-600"
                            title="Clear Filters"
                        >
                            <RefreshCw size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white h-48 rounded-[32px] animate-pulse border border-slate-100" />
                    ))}
                </div>
            ) : appointments.length > 0 ? (
                /* Desktop Table & Mobile Cards */
                <div className="space-y-6">
                    {/* List View */}
                    <div className="hidden lg:block overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {appointments.map((appt) => (
                                    <tr key={appt.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{appt.patient_name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{appt.patient_phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-bold text-slate-600">{appt.service?.name || 'Dental Appointment'}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="text-xs font-bold text-slate-700">{formatDate(appt.appointment_date)}</p>
                                                <p className="text-[10px] font-bold text-blue-500 mt-0.5">{formatTime(appt.start_time)} — {formatTime(appt.end_time)}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(appt.status)}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <ActionButtons appt={appt} mutationLoading={mutationLoading} onApprove={handleApprove} onReject={(id) => setRejectModal({ isOpen: true, appointmentId: id, reason: '' })} onReschedule={(id) => setRescheduleModal({ ...rescheduleModal, isOpen: true, appointmentId: id })} onComplete={handleComplete} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {appointments.map((appt) => (
                            <div key={appt.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(appt.status)}`}>
                                            {appt.status}
                                        </span>
                                        <h3 className="text-base font-black text-slate-800 mt-2">{appt.patient_name}</h3>
                                        <p className="text-xs font-bold text-slate-400">{appt.patient_phone}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <CalendarDays size={20} />
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-slate-50/50 rounded-2xl space-y-2">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Clock size={14} />
                                        <p className="text-xs font-bold">{formatDate(appt.appointment_date)}</p>
                                    </div>
                                    <p className="text-[11px] font-bold text-blue-600 ml-6">{formatTime(appt.start_time)} — {formatTime(appt.end_time)}</p>
                                </div>

                                {appt.patient_notes && (
                                    <div className="flex gap-2">
                                        <MessageSquare size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-slate-500 italic">"{appt.patient_notes}"</p>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <ActionButtons appt={appt} isMobile mutationLoading={mutationLoading} onApprove={handleApprove} onReject={(id) => setRejectModal({ isOpen: true, appointmentId: id, reason: '' })} onReschedule={(id) => setRescheduleModal({ ...rescheduleModal, isOpen: true, appointmentId: id })} onComplete={handleComplete} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                        <Calendar size={40} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">No appointments found</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1">Try adjusting your filters</p>
                    {(dateFilter || statusFilter) && (
                        <button 
                            onClick={() => { setDateFilter(''); setStatusFilter(''); }}
                            className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setRejectModal({ ...rejectModal, isOpen: false })} />
                    <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-black text-slate-900 mb-2">Reject Appointment</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Reason for rejection is required</p>
                        
                        <form onSubmit={handleRejectSubmit} className="space-y-6">
                            <textarea 
                                required
                                value={rejectModal.reason}
                                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-red-500 transition-all resize-none"
                                rows="4"
                                placeholder="Explain why the appointment cannot be confirmed..."
                            />
                            <div className="flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setRejectModal({ ...rejectModal, isOpen: false })}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={mutationLoading}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
                                >
                                    {mutationLoading ? 'Processing...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {rescheduleModal.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setRescheduleModal({ ...rescheduleModal, isOpen: false })} />
                    <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-black text-slate-900 mb-2">Reschedule Appointment</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Propose a new date and time</p>
                        
                        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Date</label>
                                <input 
                                    type="date"
                                    required
                                    value={rescheduleModal.new_date}
                                    onChange={(e) => setRescheduleModal({ ...rescheduleModal, new_date: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Time</label>
                                <input 
                                    type="time"
                                    required
                                    value={rescheduleModal.new_time}
                                    onChange={(e) => setRescheduleModal({ ...rescheduleModal, new_time: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                                <textarea 
                                    required
                                    value={rescheduleModal.reason}
                                    onChange={(e) => setRescheduleModal({ ...rescheduleModal, reason: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all resize-none"
                                    rows="3"
                                    placeholder="Briefly explain the reason for rescheduling..."
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setRescheduleModal({ ...rescheduleModal, isOpen: false })}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={mutationLoading}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                                >
                                    {mutationLoading ? 'Processing...' : 'Send Proposal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function ActionButtons({ appt, isMobile, mutationLoading, onApprove, onReject, onReschedule, onComplete }) {
    if (appt.status === 'pending') {
        return (
            <div className={`flex flex-wrap items-center gap-2 ${!isMobile && 'justify-end'}`}>
                <button 
                    onClick={() => onApprove(appt.id)}
                    disabled={mutationLoading === appt.id}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-50"
                >
                    {mutationLoading === appt.id ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check size={14} strokeWidth={3} />}
                    Approve
                </button>
                <button 
                    onClick={() => onReject(appt.id)}
                    disabled={mutationLoading === appt.id}
                    className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                >
                    Reject
                </button>
                <button 
                    onClick={() => onReschedule(appt.id)}
                    disabled={mutationLoading === appt.id}
                    className="px-4 py-2 bg-blue-50 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100"
                >
                    Reschedule
                </button>
            </div>
        );
    }

    if (appt.status === 'confirmed') {
        return (
            <div className={`flex flex-wrap items-center gap-2 ${!isMobile && 'justify-end'}`}>
                <button 
                    onClick={() => onComplete(appt.id)}
                    disabled={mutationLoading === appt.id}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                    {mutationLoading === appt.id ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={14} />}
                    Complete
                </button>
                <button 
                    onClick={() => onReschedule(appt.id)}
                    disabled={mutationLoading === appt.id}
                    className="px-4 py-2 bg-blue-50 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100"
                >
                    Reschedule
                </button>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${!isMobile && 'justify-end'} opacity-50`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No actions available</span>
        </div>
    );
}