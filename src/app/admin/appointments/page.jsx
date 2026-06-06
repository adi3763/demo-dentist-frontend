'use client';
import { useState, useEffect } from 'react';
import { 
    Calendar, 
    Clock, 
    Phone, 
    Mail, 
    MessageSquare,
    RefreshCw,
    Search,
    AlertCircle,
    X,
    CalendarDays,
    User,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Eye,
    Stethoscope,
    CalendarClock,
    CheckCircle2
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

    const [filters, setFilters] = useState({ date: '', status: '', doctor_id: '', search: '', page: 1 });
    const [detailModal, setDetailModal] = useState({ isOpen: false, appointment: null });
    const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, appointmentId: null });
    const [rescheduleForm, setRescheduleForm] = useState({ new_date: '', new_time: '', reason: '' });
    const [rescheduleError, setRescheduleError] = useState('');
    const [rescheduleLoading, setRescheduleLoading] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => { if (isAdmin) fetchDoctors(); }, [isAdmin]);
    useEffect(() => { fetchAppointments(); }, [filters, isAdmin]);

    const fetchDoctors = async () => {
        try {
            const res = await apiService.getAdminUsers('active');
            const data = await res.json();
            if (res.ok) setDoctors(data.users || []);
        } catch (err) { console.error(err); }
    };

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = isAdmin
                ? await apiService.getAdminAppointments(filters)
                : await apiService.getDoctorAppointments(filters);
            if (response.status === 401) { router.push('/admin/login'); return; }
            const data = await response.json();
            if (response.ok) {
                setAppointments(data.data || []);
                setPagination({ current_page: data.current_page || 1, last_page: data.last_page || 1, total: data.total || 0 });
            } else {
                setError(data.message || 'Failed to load appointments');
            }
        } catch { setError('Connection error'); }
        finally { setLoading(false); }
    };

    const openRescheduleModal = (appointmentId) => {
        setRescheduleModal({ isOpen: true, appointmentId });
        setRescheduleForm({ new_date: '', new_time: '', reason: '' });
        setRescheduleError('');
    };
    const closeRescheduleModal = () => { setRescheduleModal({ isOpen: false, appointmentId: null }); setRescheduleError(''); };

    const handleRescheduleSubmit = async (e) => {
        e.preventDefault();
        if (!rescheduleForm.new_date || !rescheduleForm.new_time || !rescheduleForm.reason.trim()) {
            setRescheduleError('Please fill in all fields.'); return;
        }
        setRescheduleLoading(true);
        setRescheduleError('');
        try {
            const res = isAdmin
                ? await apiService.rescheduleAdminAppointment(rescheduleModal.appointmentId, rescheduleForm)
                : await apiService.rescheduleAppointment(rescheduleModal.appointmentId, rescheduleForm);
            if (res.ok) {
                closeRescheduleModal();
                if (detailModal.isOpen) setDetailModal({ isOpen: false, appointment: null });
                fetchAppointments();
            } else {
                const data = await res.json();
                setRescheduleError(data.message || 'Failed to reschedule. Please try again.');
            }
        } catch { setRescheduleError('Connection error. Please try again.'); }
        finally { setRescheduleLoading(false); }
    };

    const handleUpdateStatus = async (id, status) => {
        setMutationLoading(id);
        try {
            let res;
            if (isAdmin) {
                let reason = undefined;
                if (status === 'rejected') { reason = prompt('Reason for rejection?'); if (reason === null) return; }
                res = await apiService.updateAdminAppointmentStatus(id, status, reason);
            } else {
                if (status === 'confirmed')  res = await apiService.approveAppointment(id);
                else if (status === 'completed') res = await apiService.completeAppointment(id);
                else if (status === 'rejected') {
                    const reason = prompt('Reason for rejection?');
                    if (reason === null) return;
                    res = await apiService.rejectAppointment(id, reason || 'Schedule conflict');
                }
            }
            if (res && res.ok) { fetchAppointments(); if (detailModal.isOpen) setDetailModal({ ...detailModal, isOpen: false }); }
        } finally { setMutationLoading(null); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this appointment record?')) return;
        setMutationLoading(id);
        try { const res = await apiService.deleteAdminAppointment(id); if (res.ok) fetchAppointments(); }
        finally { setMutationLoading(null); }
    };

    const viewDetails = async (id) => {
        if (!isAdmin) return;
        try {
            const res = await apiService.getAdminAppointmentById(id);
            const data = await res.json();
            if (res.ok) setDetailModal({ isOpen: true, appointment: data.appointment });
        } catch (err) { console.error(err); }
    };

    const formatTime = (t) => {
        if (!t) return '';
        const [h, m] = t.split(':');
        const hr = parseInt(h);
        return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const formatDateShort = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const statusStyles = (s) => ({
        pending:     'bg-amber-50 text-amber-600 border-amber-200',
        confirmed:   'bg-emerald-50 text-emerald-600 border-emerald-200',
        rejected:    'bg-red-50 text-red-600 border-red-200',
        rescheduled: 'bg-blue-50 text-blue-600 border-blue-200',
        completed:   'bg-slate-100 text-slate-500 border-slate-200',
        cancelled:   'bg-slate-50 text-slate-400 border-slate-200',
    }[s] || 'bg-slate-50 text-slate-500 border-slate-200');

    /* ── Doctor action buttons (reused in card + table) ── */
    const DoctorActions = ({ appt }) => (
        <div className="flex flex-wrap gap-2">
            {appt.status === 'pending' && (<>
                <ActionBtn color="emerald" onClick={() => handleUpdateStatus(appt.id, 'confirmed')}>Approve</ActionBtn>
                <ActionBtn color="blue" icon={<CalendarClock size={11}/>} onClick={() => openRescheduleModal(appt.id)}>Reschedule</ActionBtn>
                <ActionBtn color="red" onClick={() => handleUpdateStatus(appt.id, 'rejected')}>Reject</ActionBtn>
            </>)}
            {appt.status === 'confirmed' && (<>
                <ActionBtn color="blue" icon={<CalendarClock size={11}/>} onClick={() => openRescheduleModal(appt.id)}>Reschedule</ActionBtn>
                <ActionBtn color="slate" onClick={() => handleUpdateStatus(appt.id, 'completed')}>Complete</ActionBtn>
            </>)}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Appointments</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {isAdmin ? 'Global appointment management' : 'Your patient schedule'}
                    </p>
                </div>
                <button onClick={fetchAppointments}
                    className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm flex-shrink-0">
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* ── Filters ── */}
            <div className="bg-white p-4 sm:p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
                {/* Search (full width) */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                    <input type="text" placeholder="Search patient name or phone..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                        className="w-full bg-slate-50 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                </div>

                {/* Filters row */}
                <div className="flex flex-wrap gap-2 items-center">
                    <input type="date" value={filters.date}
                        onChange={(e) => setFilters({ ...filters, date: e.target.value, page: 1 })}
                        className="flex-1 min-w-[130px] bg-slate-50 rounded-2xl py-2.5 px-3 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />

                    <select value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="flex-1 min-w-[120px] bg-slate-50 rounded-2xl py-2.5 px-3 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none">
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rescheduled">Rescheduled</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {isAdmin && (
                        <select value={filters.doctor_id}
                            onChange={(e) => setFilters({ ...filters, doctor_id: e.target.value, page: 1 })}
                            className="flex-1 min-w-[130px] bg-slate-50 rounded-2xl py-2.5 px-3 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none">
                            <option value="">All Doctors</option>
                            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    )}

                    <button onClick={() => setFilters({ date: '', status: '', doctor_id: '', search: '', page: 1 })}
                        className="p-2.5 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50" title="Clear">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">

                {/* ── MOBILE: Card List (hidden on md+) ── */}
                <div className="block md:hidden divide-y divide-slate-50">
                    {loading ? (
                        [1,2,3,4].map(i => (
                            <div key={i} className="p-5 animate-pulse">
                                <div className="h-4 bg-slate-100 rounded-full w-2/3 mb-2" />
                                <div className="h-3 bg-slate-50 rounded-full w-1/2" />
                            </div>
                        ))
                    ) : appointments.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <CalendarDays size={40} className="mx-auto mb-3 opacity-10" />
                            <p className="text-xs font-bold uppercase tracking-widest">No appointments found</p>
                        </div>
                    ) : appointments.map((appt) => (
                        <div key={appt.id} className="p-5 space-y-3">
                            {/* Row 1: Patient + Status badge */}
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-black text-slate-900">{appt.patient_name}</p>
                                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                        <Phone size={10} /> {appt.patient_phone}
                                    </p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex-shrink-0 ${statusStyles(appt.status)}`}>
                                    {appt.status}
                                </span>
                            </div>

                            {/* Row 2: Service + Date */}
                            <div className="flex items-center gap-4 text-xs">
                                <span className="font-bold text-blue-600 flex items-center gap-1">
                                    <Stethoscope size={11} className="text-blue-400" />
                                    {appt.service?.name || 'Dental Visit'}
                                </span>
                                <span className="font-bold text-slate-500 flex items-center gap-1">
                                    <Calendar size={11} className="text-slate-300" />
                                    {formatDateShort(appt.appointment_date)} · {formatTime(appt.start_time)}
                                </span>
                            </div>

                            {/* Row 3: Doctor (admin only) */}
                            {isAdmin && (
                                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                    <User size={10} className="text-slate-300" />
                                    {appt.doctor?.name || 'Unassigned'}
                                </p>
                            )}

                            {/* Row 4: Action buttons */}
                            <div className="flex items-center justify-between pt-1 gap-2">
                                {isAdmin ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => viewDetails(appt.id)}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-bold hover:bg-blue-100 transition-all">
                                            <Eye size={13} /> View
                                        </button>
                                        <button onClick={() => openRescheduleModal(appt.id)}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[11px] font-bold hover:bg-indigo-100 transition-all">
                                            <CalendarClock size={13} /> Reschedule
                                        </button>
                                        <button onClick={() => handleDelete(appt.id)}
                                            className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                ) : (
                                    <DoctorActions appt={appt} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── DESKTOP: Table (hidden on mobile) ── */}
                <div className="hidden md:block overflow-x-auto">
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
                                [1,2,3,4,5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={isAdmin ? 6 : 5} className="h-20 bg-white/50" />
                                    </tr>
                                ))
                            ) : appointments.length > 0 ? appointments.map((appt) => (
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
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusStyles(appt.status)}`}>
                                            {appt.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {isAdmin ? (
                                                <>
                                                    <button onClick={() => viewDetails(appt.id)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View">
                                                        <Eye size={17} />
                                                    </button>
                                                    <button onClick={() => openRescheduleModal(appt.id)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Reschedule">
                                                        <CalendarClock size={17} />
                                                    </button>
                                                    <button onClick={() => handleDelete(appt.id)}
                                                        className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                                                        <Trash2 size={17} />
                                                    </button>
                                                </>
                                            ) : (
                                                <DoctorActions appt={appt} />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="py-20 text-center text-slate-400">
                                        <CalendarDays size={44} className="mx-auto mb-3 opacity-10" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No appointments found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="p-5 sm:p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">
                            Page {pagination.current_page} of {pagination.last_page} · {pagination.total} total
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest sm:hidden">
                            {pagination.current_page} / {pagination.last_page}
                        </p>
                        <div className="flex items-center gap-2">
                            <button disabled={filters.page === 1}
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-40">
                                <ChevronLeft size={17} />
                            </button>
                            <button disabled={filters.page === pagination.last_page}
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-40">
                                <ChevronRight size={17} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Detail Modal (Admin) ────────────────────────────────── */}
            {detailModal.isOpen && detailModal.appointment && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDetailModal({ isOpen: false, appointment: null })} />
                    {/* Sheet on mobile, centered card on desktop */}
                    <div className="relative w-full sm:max-w-xl bg-white sm:rounded-[40px] rounded-t-[32px] shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        {/* Drag handle (mobile) */}
                        <div className="sm:hidden flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-slate-200 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 sm:px-10 py-5 sm:pt-10 border-b border-slate-50 sm:border-none flex-shrink-0">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Appointment Details</h2>
                            <button onClick={() => setDetailModal({ isOpen: false, appointment: null })}
                                className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div className="overflow-y-auto flex-1 px-6 sm:px-10 py-5 sm:pb-10 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DetailItem label="Patient" value={detailModal.appointment.patient_name} icon={User} />
                                <DetailItem label="Phone" value={detailModal.appointment.patient_phone} icon={Phone} />
                                <DetailItem label="Email" value={detailModal.appointment.patient_email || 'Not provided'} icon={Mail} />
                                <DetailItem label="Doctor" value={detailModal.appointment.doctor?.name} icon={User} />
                                <DetailItem label="Service" value={detailModal.appointment.service?.name} icon={Stethoscope} />
                                <DetailItem label="Scheduled" value={`${formatDate(detailModal.appointment.appointment_date)} · ${formatTime(detailModal.appointment.start_time)}`} icon={Clock} />
                            </div>

                            {detailModal.appointment.patient_notes && (
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <MessageSquare size={12} /> Patient Notes
                                    </p>
                                    <p className="text-sm font-medium text-slate-700">"{detailModal.appointment.patient_notes}"</p>
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-3">Update Status</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {['pending', 'confirmed', 'rejected', 'completed', 'cancelled'].map(s => (
                                        <button key={s}
                                            onClick={() => handleUpdateStatus(detailModal.appointment.id, s)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                detailModal.appointment.status === s
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                                            }`}>
                                            {s}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => openRescheduleModal(detailModal.appointment.id)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${
                                            detailModal.appointment.status === 'rescheduled'
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300'
                                        }`}>
                                        <CalendarClock size={11} /> Reschedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Reschedule Modal ────────────────────────────────────── */}
            {rescheduleModal.isOpen && (
                <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={closeRescheduleModal} />
                    <div className="relative w-full sm:max-w-md bg-white sm:rounded-[40px] rounded-t-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[95vh] flex flex-col">

                        {/* Drag handle (mobile) */}
                        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
                            <div className="w-10 h-1 bg-white/40 rounded-full" />
                        </div>

                        {/* Gradient header */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-5 sm:p-8 text-white flex-shrink-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <CalendarClock size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black tracking-tight">Reschedule Appointment</h2>
                                        <p className="text-blue-200 text-[11px] font-semibold mt-0.5">Patient notified via WhatsApp</p>
                                    </div>
                                </div>
                                <button onClick={closeRescheduleModal}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable form */}
                        <form onSubmit={handleRescheduleSubmit} className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-4">

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={15} />
                                    <input type="date" min={today} required
                                        value={rescheduleForm.new_date}
                                        onChange={(e) => setRescheduleForm({ ...rescheduleForm, new_date: e.target.value })}
                                        className="w-full bg-slate-50 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all border border-transparent focus:border-blue-100" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={15} />
                                    <input type="time" required
                                        value={rescheduleForm.new_time}
                                        onChange={(e) => setRescheduleForm({ ...rescheduleForm, new_time: e.target.value })}
                                        className="w-full bg-slate-50 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all border border-transparent focus:border-blue-100" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason</label>
                                <textarea required rows={3}
                                    value={rescheduleForm.reason}
                                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                                    placeholder="e.g. Doctor unavailable, emergency, schedule conflict..."
                                    className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all border border-transparent focus:border-blue-100 resize-none" />
                            </div>

                            {rescheduleError && (
                                <div className="flex items-center gap-3 p-3.5 bg-red-50 rounded-2xl border border-red-100">
                                    <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                                    <p className="text-xs font-bold text-red-600">{rescheduleError}</p>
                                </div>
                            )}

                            <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
                                <MessageSquare size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                                    Patient receives a WhatsApp message with the new slot and a link to contact the clinic if the time doesn't work.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-1 pb-safe">
                                <button type="button" onClick={closeRescheduleModal}
                                    className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={rescheduleLoading}
                                    className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-black hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-60 flex items-center justify-center gap-2">
                                    {rescheduleLoading
                                        ? <><RefreshCw size={14} className="animate-spin" /> Saving...</>
                                        : <><CalendarClock size={14} /> Confirm Reschedule</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Shared helper components ────────────────────────────── */

function ActionBtn({ color, icon, onClick, children }) {
    const colors = {
        emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        blue:    'bg-blue-500 hover:bg-blue-600 text-white',
        red:     'bg-red-500 hover:bg-red-600 text-white',
        slate:   'bg-slate-800 hover:bg-slate-700 text-white',
    };
    return (
        <button onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors flex items-center gap-1 ${colors[color]}`}>
            {icon}{children}
        </button>
    );
}

function DetailItem({ label, value, icon: Icon }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                <Icon size={15} />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-xs font-bold text-slate-800 break-words">{value}</p>
            </div>
        </div>
    );
}