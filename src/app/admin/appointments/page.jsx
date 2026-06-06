'use client';
import { useState, useEffect } from 'react';
import { 
    Calendar, Clock, Phone, Mail, MessageSquare, RefreshCw, Search,
    AlertCircle, X, CalendarDays, User, ChevronLeft, ChevronRight,
    Trash2, Eye, Stethoscope, CalendarClock, CheckCircle2, XCircle,
    Check, Ban, RotateCcw, CircleDot
} from 'lucide-react';
import apiService from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

/* ─────────────────────────────────────────────────────────────────
   Doctor action map — what API to call for each doctor action
───────────────────────────────────────────────────────────────── */
const DOCTOR_ACTIONS = [
    {
        key: 'confirmed',
        label: 'Approve',
        icon: CheckCircle2,
        color: 'emerald',
        applies: (s) => ['pending', 'rescheduled'].includes(s),
    },
    {
        key: 'reschedule',
        label: 'Reschedule',
        icon: CalendarClock,
        color: 'blue',
        applies: (s) => ['pending', 'confirmed', 'rescheduled'].includes(s),
        isSpecial: true, // opens reschedule modal
    },
    {
        key: 'rejected',
        label: 'Reject',
        icon: XCircle,
        color: 'red',
        applies: (s) => ['pending', 'confirmed', 'rescheduled'].includes(s),
        isSpecial: true, // opens reject modal
    },
    {
        key: 'completed',
        label: 'Mark Complete',
        icon: Check,
        color: 'slate',
        applies: (s) => s === 'confirmed',
    },
];

const COLOR_MAP = {
    emerald: {
        active:   'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100',
        inactive: 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed',
    },
    blue: {
        active:   'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-100',
        inactive: 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed',
    },
    red: {
        active:   'bg-red-500 hover:bg-red-600 text-white shadow-red-100',
        inactive: 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed',
    },
    slate: {
        active:   'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-100',
        inactive: 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed',
    },
};

/* ─────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────── */
export default function AppointmentsManagementPage() {
    const { user } = useAuth();
    const router = useRouter();
    const isAdmin = user?.role === 'admin';

    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [mutationLoading, setMutationLoading] = useState(null);

    const [filters, setFilters] = useState({ date: '', status: '', doctor_id: '', search: '', page: 1 });

    // Admin detail modal (fetches from API)
    const [adminDetail, setAdminDetail] = useState({ isOpen: false, appointment: null });
    // Doctor detail modal (uses existing list data)
    const [doctorDetail, setDoctorDetail] = useState({ isOpen: false, appointment: null });

    // Reschedule modal (shared)
    const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, appointmentId: null });
    const [rescheduleForm, setRescheduleForm] = useState({ new_date: '', new_time: '', reason: '' });
    const [rescheduleError, setRescheduleError] = useState('');
    const [rescheduleLoading, setRescheduleLoading] = useState(false);

    // Reject modal (shared — replaces browser prompt())
    const [rejectModal, setRejectModal] = useState({ isOpen: false, appointmentId: null });
    const [rejectReason, setRejectReason] = useState('');
    const [rejectLoading, setRejectLoading] = useState(false);
    const [rejectError, setRejectError] = useState('');

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => { if (isAdmin) fetchDoctors(); }, [isAdmin]);
    useEffect(() => { fetchAppointments(); }, [filters, isAdmin]);

    /* ── Data fetching ─────────────────────────────────────────── */
    const fetchDoctors = async () => {
        try {
            const res = await apiService.getAdminUsers('active');
            const data = await res.json();
            if (res.ok) setDoctors(data.users || []);
        } catch (e) { console.error(e); }
    };

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = isAdmin
                ? await apiService.getAdminAppointments(filters)
                : await apiService.getDoctorAppointments(filters);
            if (response.status === 401) { router.push('/admin/login'); return; }
            const data = await response.json();
            if (response.ok) {
                setAppointments(data.data || []);
                setPagination({ current_page: data.current_page || 1, last_page: data.last_page || 1, total: data.total || 0 });
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    /* ── Reschedule modal ──────────────────────────────────────── */
    const openRescheduleModal = (id) => {
        setRescheduleModal({ isOpen: true, appointmentId: id });
        setRescheduleForm({ new_date: '', new_time: '', reason: '' });
        setRescheduleError('');
    };
    const closeRescheduleModal = () => { setRescheduleModal({ isOpen: false, appointmentId: null }); setRescheduleError(''); };

    const submitReschedule = async (e) => {
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
                setAdminDetail({ isOpen: false, appointment: null });
                setDoctorDetail({ isOpen: false, appointment: null });
                fetchAppointments();
            } else {
                const d = await res.json();
                setRescheduleError(d.message || 'Failed to reschedule.');
            }
        } catch { setRescheduleError('Connection error.'); }
        finally { setRescheduleLoading(false); }
    };

    /* ── Reject modal ──────────────────────────────────────────── */
    const openRejectModal = (id) => {
        setRejectModal({ isOpen: true, appointmentId: id });
        setRejectReason('');
        setRejectError('');
    };
    const closeRejectModal = () => { setRejectModal({ isOpen: false, appointmentId: null }); setRejectReason(''); setRejectError(''); };

    const submitReject = async (e) => {
        e.preventDefault();
        if (!rejectReason.trim()) { setRejectError('Please provide a reason.'); return; }
        setRejectLoading(true);
        setRejectError('');
        try {
            const res = isAdmin
                ? await apiService.updateAdminAppointmentStatus(rejectModal.appointmentId, 'rejected', rejectReason)
                : await apiService.rejectAppointment(rejectModal.appointmentId, rejectReason);
            if (res.ok) {
                closeRejectModal();
                setAdminDetail({ isOpen: false, appointment: null });
                setDoctorDetail({ isOpen: false, appointment: null });
                fetchAppointments();
            } else {
                const d = await res.json();
                setRejectError(d.message || 'Failed to reject.');
            }
        } catch { setRejectError('Connection error.'); }
        finally { setRejectLoading(false); }
    };

    /* ── Status update (non-special) ───────────────────────────── */
    const handleAdminStatus = async (id, status) => {
        if (status === 'rejected') { openRejectModal(id); return; }
        setMutationLoading(id + status);
        try {
            const res = await apiService.updateAdminAppointmentStatus(id, status);
            if (res.ok) { setAdminDetail({ isOpen: false, appointment: null }); fetchAppointments(); }
        } finally { setMutationLoading(null); }
    };

    const handleDoctorAction = (appt, actionKey) => {
        if (actionKey === 'reschedule') { openRescheduleModal(appt.id); return; }
        if (actionKey === 'rejected')   { openRejectModal(appt.id); return; }
        executeDoctorAction(appt.id, actionKey);
    };

    const executeDoctorAction = async (id, actionKey) => {
        setMutationLoading(id + actionKey);
        try {
            let res;
            if (actionKey === 'confirmed') res = await apiService.approveAppointment(id);
            if (actionKey === 'completed') res = await apiService.completeAppointment(id);
            if (res?.ok) { setDoctorDetail({ isOpen: false, appointment: null }); fetchAppointments(); }
        } finally { setMutationLoading(null); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this appointment record?')) return;
        setMutationLoading(id + 'del');
        try { const res = await apiService.deleteAdminAppointment(id); if (res.ok) fetchAppointments(); }
        finally { setMutationLoading(null); }
    };

    const openAdminDetail = async (id) => {
        try {
            const res = await apiService.getAdminAppointmentById(id);
            const data = await res.json();
            if (res.ok) setAdminDetail({ isOpen: true, appointment: data.appointment });
        } catch (e) { console.error(e); }
    };

    /* ── Formatters ────────────────────────────────────────────── */
    const fmtTime = (t) => {
        if (!t) return '—';
        const [h, m] = t.split(':');
        const hr = parseInt(h);
        return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
    };
    const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const fmtShort = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const statusStyle = (s) => ({
        pending:     'bg-amber-50 text-amber-600 border-amber-200',
        confirmed:   'bg-emerald-50 text-emerald-600 border-emerald-200',
        rejected:    'bg-red-50 text-red-600 border-red-200',
        rescheduled: 'bg-blue-50 text-blue-600 border-blue-200',
        completed:   'bg-slate-100 text-slate-500 border-slate-200',
        cancelled:   'bg-slate-50 text-slate-400 border-slate-200',
    }[s] ?? 'bg-slate-50 text-slate-500 border-slate-200');

    /* ─────────────────────────────────────────────────────────────
       Doctor Action Grid — same 2×2 layout regardless of role
    ───────────────────────────────────────────────────────────── */
    const DoctorActionGrid = ({ appt, size = 'md' }) => {
        const py = size === 'sm' ? 'py-2' : 'py-3.5';
        const text = size === 'sm' ? 'text-[10px]' : 'text-sm';
        const iconSz = size === 'sm' ? 13 : 16;
        return (
            <div className="grid grid-cols-2 gap-2">
                {DOCTOR_ACTIONS.map(({ key, label, icon: Icon, color, applies, isSpecial }) => {
                    const enabled = applies(appt.status);
                    const cls = enabled ? COLOR_MAP[color].active : COLOR_MAP[color].inactive;
                    return (
                        <button
                            key={key}
                            disabled={!enabled || mutationLoading}
                            onClick={() => enabled && handleDoctorAction(appt, key)}
                            className={`${py} ${text} font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm ${cls}`}
                        >
                            <Icon size={iconSz} />
                            {label}
                        </button>
                    );
                })}
            </div>
        );
    };

    /* ─────────────────────────────────────────────────────────────
       Admin Status Grid — same layout as doctor grid
    ───────────────────────────────────────────────────────────── */
    const AdminStatusGrid = ({ appt }) => {
        const statuses = [
            { key: 'confirmed',   label: 'Confirm',      icon: CheckCircle2, color: 'emerald' },
            { key: 'reschedule',  label: 'Reschedule',   icon: CalendarClock, color: 'blue',  special: true },
            { key: 'rejected',    label: 'Reject',       icon: XCircle,      color: 'red',    special: true },
            { key: 'completed',   label: 'Complete',     icon: Check,        color: 'slate' },
            { key: 'pending',     label: 'Set Pending',  icon: RotateCcw,    color: 'amber' },
            { key: 'cancelled',   label: 'Cancel',       icon: Ban,          color: 'rose' },
        ];
        const colors = {
            ...COLOR_MAP,
            amber: { active: 'bg-amber-400 hover:bg-amber-500 text-white shadow-amber-100', inactive: '' },
            rose:  { active: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-100', inactive: '' },
        };
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {statuses.map(({ key, label, icon: Icon, color, special }) => {
                    const isActive = appt.status === key || (key === 'reschedule' && appt.status === 'rescheduled');
                    const cls = isActive
                        ? `${colors[color].active} ring-2 ring-offset-1 ring-${color}-300`
                        : colors[color].active;
                    return (
                        <button
                            key={key}
                            onClick={() => {
                                if (key === 'reschedule' || special && key === 'reschedule') { openRescheduleModal(appt.id); }
                                else if (key === 'rejected') { openRejectModal(appt.id); }
                                else { handleAdminStatus(appt.id, key); }
                            }}
                            className={`py-3 text-sm font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm ${cls}`}
                        >
                            <Icon size={15} />{label}
                        </button>
                    );
                })}
            </div>
        );
    };

    /* ══════════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════════ */
    return (
        <div className="space-y-6">

            {/* Header */}
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

            {/* Filters */}
            <div className="bg-white p-4 sm:p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                    <input type="text" placeholder="Search patient name or phone..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                        className="w-full bg-slate-50 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                </div>
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
                        className="p-2.5 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* ── Appointments List ────────────────────────────────────── */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">

                {/* MOBILE: Cards */}
                <div className="block md:hidden divide-y divide-slate-50">
                    {loading ? (
                        [1,2,3,4].map(i => (
                            <div key={i} className="p-5 animate-pulse space-y-2">
                                <div className="h-4 bg-slate-100 rounded-full w-2/3" />
                                <div className="h-3 bg-slate-50 rounded-full w-1/2" />
                            </div>
                        ))
                    ) : appointments.length === 0 ? <EmptyState /> : appointments.map(appt => (
                        <div key={appt.id} className="p-5 space-y-3">
                            {/* Patient + status */}
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-black text-slate-900">{appt.patient_name}</p>
                                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                        <Phone size={10}/> {appt.patient_phone}
                                    </p>
                                </div>
                                <StatusBadge status={appt.status} style={statusStyle(appt.status)} />
                            </div>

                            {/* Service + date */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                <span className="font-bold text-blue-600 flex items-center gap-1">
                                    <Stethoscope size={11} className="text-blue-400"/>
                                    {appt.service?.name || 'Dental Visit'}
                                </span>
                                <span className="font-bold text-slate-500 flex items-center gap-1">
                                    <Calendar size={11} className="text-slate-300"/>
                                    {fmtShort(appt.appointment_date)} · {fmtTime(appt.start_time)}
                                </span>
                            </div>

                            {/* Doctor row (admin) */}
                            {isAdmin && (
                                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                    <User size={10} className="text-slate-300"/> {appt.doctor?.name || 'Unassigned'}
                                </p>
                            )}

                            {/* Rescheduled slot pill */}
                            {appt.status === 'rescheduled' && appt.rescheduled_date && (
                                <div className="p-2.5 bg-blue-50 rounded-xl flex items-center gap-2">
                                    <CalendarClock size={12} className="text-blue-500 flex-shrink-0"/>
                                    <p className="text-[11px] font-bold text-blue-700">
                                        New slot: {fmtShort(appt.rescheduled_date)}
                                        {appt.rescheduled_start_time ? ` · ${fmtTime(appt.rescheduled_start_time)}` : ''}
                                    </p>
                                </div>
                            )}

                            {/* Card actions — same layout for both roles */}
                            <div className="flex gap-2 pt-1">
                                {/* View (both) */}
                                <button
                                    onClick={() => isAdmin ? openAdminDetail(appt.id) : setDoctorDetail({ isOpen: true, appointment: appt })}
                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black hover:bg-slate-800 transition-all flex-1 justify-center">
                                    <Eye size={14}/> View & Manage
                                </button>
                                {/* Delete (admin only) */}
                                {isAdmin && (
                                    <button onClick={() => handleDelete(appt.id)}
                                        className="p-2.5 text-red-400 hover:bg-red-50 rounded-2xl transition-all border border-red-100">
                                        <Trash2 size={16}/>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* DESKTOP: Table */}
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
                                        <td colSpan={isAdmin ? 6 : 5} className="h-20 bg-white/50"/>
                                    </tr>
                                ))
                            ) : appointments.length > 0 ? appointments.map(appt => (
                                <tr key={appt.id} className="hover:bg-slate-50/30 transition-colors group">
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
                                        <p className="text-xs font-bold text-slate-700">{fmtDate(appt.appointment_date)}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{fmtTime(appt.start_time)}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <StatusBadge status={appt.status} style={statusStyle(appt.status)}/>
                                    </td>
                                    <td className="px-8 py-5">
                                        {/* Icon buttons — same icons for both roles */}
                                        <div className="flex items-center justify-end gap-1">
                                            {/* View detail */}
                                            <IconBtn title="View & Manage"
                                                onClick={() => isAdmin ? openAdminDetail(appt.id) : setDoctorDetail({ isOpen: true, appointment: appt })}
                                                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                <Eye size={17}/>
                                            </IconBtn>
                                            {/* Approve (doctor pending only) */}
                                            {!isAdmin && appt.status === 'pending' && (
                                                <IconBtn title="Approve"
                                                    onClick={() => executeDoctorAction(appt.id, 'confirmed')}
                                                    className="text-emerald-500 hover:bg-emerald-50">
                                                    <CheckCircle2 size={17}/>
                                                </IconBtn>
                                            )}
                                            {/* Reschedule (both roles) */}
                                            {(isAdmin || ['pending','confirmed','rescheduled'].includes(appt.status)) && (
                                                <IconBtn title="Reschedule"
                                                    onClick={() => openRescheduleModal(appt.id)}
                                                    className="text-blue-400 hover:text-blue-600 hover:bg-blue-50">
                                                    <CalendarClock size={17}/>
                                                </IconBtn>
                                            )}
                                            {/* Reject (both roles, pending/confirmed) */}
                                            {(isAdmin || ['pending','confirmed'].includes(appt.status)) && (
                                                <IconBtn title="Reject"
                                                    onClick={() => openRejectModal(appt.id)}
                                                    className="text-red-400 hover:bg-red-50">
                                                    <XCircle size={17}/>
                                                </IconBtn>
                                            )}
                                            {/* Complete (doctor confirmed only) */}
                                            {!isAdmin && appt.status === 'confirmed' && (
                                                <IconBtn title="Mark Complete"
                                                    onClick={() => executeDoctorAction(appt.id, 'completed')}
                                                    className="text-slate-500 hover:bg-slate-100">
                                                    <Check size={17}/>
                                                </IconBtn>
                                            )}
                                            {/* Delete (admin only) */}
                                            {isAdmin && (
                                                <IconBtn title="Delete"
                                                    onClick={() => handleDelete(appt.id)}
                                                    className="text-red-400 hover:bg-red-50">
                                                    <Trash2 size={17}/>
                                                </IconBtn>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={isAdmin ? 6 : 5}><EmptyState/></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="p-5 sm:p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {pagination.current_page} / {pagination.last_page}
                            <span className="hidden sm:inline"> · {pagination.total} total</span>
                        </p>
                        <div className="flex gap-2">
                            <button disabled={filters.page === 1}
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-40">
                                <ChevronLeft size={17}/>
                            </button>
                            <button disabled={filters.page === pagination.last_page}
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-40">
                                <ChevronRight size={17}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════
                ADMIN DETAIL MODAL
            ══════════════════════════════════════════════════════════ */}
            {adminDetail.isOpen && adminDetail.appointment && (() => {
                const a = adminDetail.appointment;
                return (
                    <BottomSheet onClose={() => setAdminDetail({ isOpen: false, appointment: null })}>
                        <SheetHandle />
                        <SheetHeader title="Appointment Details" onClose={() => setAdminDetail({ isOpen: false, appointment: null })} />
                        <div className="overflow-y-auto flex-1 px-6 sm:px-10 py-5 sm:pb-10 space-y-6">
                            {/* Patient / appointment info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DI label="Patient" value={a.patient_name} icon={User} />
                                <DI label="Phone" value={a.patient_phone} icon={Phone} />
                                <DI label="Email" value={a.patient_email || 'Not provided'} icon={Mail} />
                                <DI label="Doctor" value={a.doctor?.name} icon={User} />
                                <DI label="Service" value={a.service?.name} icon={Stethoscope} />
                                <DI label="Scheduled" value={`${fmtDate(a.appointment_date)} · ${fmtTime(a.start_time)}`} icon={Clock} />
                            </div>
                            {/* Rescheduled slot */}
                            {a.rescheduled_date && (
                                <InfoPill icon={CalendarClock} color="blue"
                                    title="New Proposed Slot"
                                    value={`${fmtDate(a.rescheduled_date)} · ${fmtTime(a.rescheduled_start_time)}`}
                                    sub={a.reschedule_reason}/>
                            )}
                            {/* Notes */}
                            {a.patient_notes && <NotesBox notes={a.patient_notes} />}
                            {/* Current status */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</span>
                                <StatusBadge status={a.status} style={statusStyle(a.status)}/>
                            </div>
                            {/* Action grid */}
                            <div>
                                <SectionLabel>Update Status</SectionLabel>
                                <AdminStatusGrid appt={a} />
                            </div>
                        </div>
                    </BottomSheet>
                );
            })()}

            {/* ══════════════════════════════════════════════════════════
                DOCTOR DETAIL MODAL — Identical feature set
            ══════════════════════════════════════════════════════════ */}
            {doctorDetail.isOpen && doctorDetail.appointment && (() => {
                const a = doctorDetail.appointment;
                return (
                    <BottomSheet onClose={() => setDoctorDetail({ isOpen: false, appointment: null })}>
                        <SheetHandle />
                        <SheetHeader title="Appointment Details" onClose={() => setDoctorDetail({ isOpen: false, appointment: null })} />
                        <div className="overflow-y-auto flex-1 px-6 sm:px-10 py-5 sm:pb-10 space-y-6">
                            {/* Patient card (highlighted for doctor) */}
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 space-y-3">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Patient Information</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <DI label="Name" value={a.patient_name} icon={User} />
                                    <DI label="Phone" value={a.patient_phone} icon={Phone} />
                                    {a.patient_email && <DI label="Email" value={a.patient_email} icon={Mail} />}
                                </div>
                            </div>
                            {/* Appointment info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DI label="Service" value={a.service?.name || 'Dental Visit'} icon={Stethoscope} />
                                <DI label="Scheduled" value={`${fmtDate(a.appointment_date)} · ${fmtTime(a.start_time)}`} icon={Clock} />
                            </div>
                            {/* Rescheduled slot */}
                            {a.rescheduled_date && (
                                <InfoPill icon={CalendarClock} color="blue"
                                    title="New Proposed Slot"
                                    value={`${fmtDate(a.rescheduled_date)} · ${fmtTime(a.rescheduled_start_time)}`}
                                    sub={a.reschedule_reason}/>
                            )}
                            {/* Rejection reason */}
                            {a.rejected_reason && (
                                <InfoPill icon={XCircle} color="red"
                                    title="Rejection Reason"
                                    value={a.rejected_reason}/>
                            )}
                            {/* Patient notes */}
                            {a.patient_notes && <NotesBox notes={a.patient_notes}/>}
                            {/* Current status */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</span>
                                <StatusBadge status={a.status} style={statusStyle(a.status)}/>
                            </div>
                            {/* Action grid — all 4 actions always shown (disabled if not applicable) */}
                            <div>
                                <SectionLabel>Actions</SectionLabel>
                                <DoctorActionGrid appt={a} />
                            </div>
                        </div>
                    </BottomSheet>
                );
            })()}

            {/* ══════════════════════════════════════════════════════════
                RESCHEDULE MODAL
            ══════════════════════════════════════════════════════════ */}
            {rescheduleModal.isOpen && (
                <BottomSheet onClose={closeRescheduleModal} zIndex="z-[110]" maxWidth="sm:max-w-md">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-5 sm:p-8 text-white flex-shrink-0 sm:rounded-t-[40px] rounded-t-[32px]">
                        <div className="sm:hidden w-10 h-1 bg-white/30 rounded-full mx-auto mb-4"/>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <CalendarClock size={20}/>
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black tracking-tight">Reschedule Appointment</h2>
                                    <p className="text-blue-200 text-[11px] font-semibold mt-0.5">Patient notified via WhatsApp</p>
                                </div>
                            </div>
                            <button onClick={closeRescheduleModal} className="p-2 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"><X size={18}/></button>
                        </div>
                    </div>
                    <form onSubmit={submitReschedule} className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-4">
                        <FormField label="New Date">
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={15}/>
                                <input type="date" min={today} required value={rescheduleForm.new_date}
                                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, new_date: e.target.value })}
                                    className="w-full bg-slate-50 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all border border-transparent focus:border-blue-100"/>
                            </div>
                        </FormField>
                        <FormField label="New Time">
                            <div className="relative">
                                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={15}/>
                                <input type="time" required value={rescheduleForm.new_time}
                                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, new_time: e.target.value })}
                                    className="w-full bg-slate-50 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all border border-transparent focus:border-blue-100"/>
                            </div>
                        </FormField>
                        <FormField label="Reason">
                            <textarea required rows={3} value={rescheduleForm.reason}
                                onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                                placeholder="e.g. Doctor unavailable, emergency, schedule conflict..."
                                className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all border border-transparent focus:border-blue-100 resize-none"/>
                        </FormField>
                        {rescheduleError && <ErrorBanner msg={rescheduleError}/>}
                        <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
                            <MessageSquare size={14} className="text-blue-400 flex-shrink-0 mt-0.5"/>
                            <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                                Patient receives a WhatsApp message with the new proposed slot and a link to contact the clinic.
                            </p>
                        </div>
                        <ModalButtons
                            onCancel={closeRescheduleModal}
                            loading={rescheduleLoading}
                            loadingLabel="Saving..."
                            submitLabel="Confirm Reschedule"
                            submitIcon={<CalendarClock size={14}/>}
                            submitClass="from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-100"/>
                    </form>
                </BottomSheet>
            )}

            {/* ══════════════════════════════════════════════════════════
                REJECT MODAL
            ══════════════════════════════════════════════════════════ */}
            {rejectModal.isOpen && (
                <BottomSheet onClose={closeRejectModal} zIndex="z-[110]" maxWidth="sm:max-w-sm">
                    <div className="bg-gradient-to-br from-red-500 to-rose-600 px-6 py-5 sm:p-8 text-white flex-shrink-0 sm:rounded-t-[40px] rounded-t-[32px]">
                        <div className="sm:hidden w-10 h-1 bg-white/30 rounded-full mx-auto mb-4"/>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <XCircle size={20}/>
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black tracking-tight">Reject Appointment</h2>
                                    <p className="text-red-200 text-[11px] font-semibold mt-0.5">Patient will be notified via WhatsApp</p>
                                </div>
                            </div>
                            <button onClick={closeRejectModal} className="p-2 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"><X size={18}/></button>
                        </div>
                    </div>
                    <form onSubmit={submitReject} className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-4">
                        <FormField label="Reason for Rejection">
                            <textarea required rows={4} value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="e.g. Doctor unavailable, fully booked, outside service area..."
                                className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all border border-transparent focus:border-red-100 resize-none"/>
                        </FormField>
                        {rejectError && <ErrorBanner msg={rejectError}/>}
                        <ModalButtons
                            onCancel={closeRejectModal}
                            loading={rejectLoading}
                            loadingLabel="Rejecting..."
                            submitLabel="Confirm Rejection"
                            submitIcon={<XCircle size={14}/>}
                            submitClass="from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-100"/>
                    </form>
                </BottomSheet>
            )}
        </div>
    );
}

/* ── Shared UI Primitives ──────────────────────────────────── */

function BottomSheet({ children, onClose, zIndex = 'z-[100]', maxWidth = 'sm:max-w-xl' }) {
    return (
        <div className={`fixed inset-0 ${zIndex} flex items-end sm:items-center justify-center p-0 sm:p-4`}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}/>
            <div className={`relative w-full ${maxWidth} bg-white sm:rounded-[40px] rounded-t-[32px] shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[95vh] flex flex-col`}>
                {children}
            </div>
        </div>
    );
}

function SheetHandle() {
    return (
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-slate-200 rounded-full"/>
        </div>
    );
}

function SheetHeader({ title, onClose }) {
    return (
        <div className="flex items-center justify-between px-6 sm:px-10 py-5 sm:pt-10 border-b border-slate-50 sm:border-none flex-shrink-0">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <X size={20} className="text-slate-400"/>
            </button>
        </div>
    );
}

function IconBtn({ title, onClick, className, children }) {
    return (
        <button title={title} onClick={onClick}
            className={`p-2 rounded-xl transition-all ${className}`}>
            {children}
        </button>
    );
}

function StatusBadge({ status, style }) {
    return (
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex-shrink-0 ${style}`}>
            {status}
        </span>
    );
}

function DI({ label, value, icon: Icon }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                <Icon size={15}/>
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-xs font-bold text-slate-800 break-words">{value || '—'}</p>
            </div>
        </div>
    );
}

function InfoPill({ icon: Icon, color, title, value, sub }) {
    const colors = {
        blue: 'bg-blue-50 border-blue-100 text-blue-500',
        red:  'bg-red-50 border-red-100 text-red-500',
    };
    const textColors = { blue: 'text-blue-400', red: 'text-red-400' };
    const valColors  = { blue: 'text-blue-700',  red: 'text-red-700'  };
    return (
        <div className={`p-3.5 rounded-2xl flex items-start gap-3 border ${colors[color]}`}>
            <Icon size={16} className={`flex-shrink-0 mt-0.5 ${colors[color].split(' ')[2]}`}/>
            <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${textColors[color]}`}>{title}</p>
                <p className={`text-xs font-bold ${valColors[color]}`}>{value}</p>
                {sub && <p className={`text-[11px] mt-0.5 ${valColors[color]} opacity-70`}>{sub}</p>}
            </div>
        </div>
    );
}

function NotesBox({ notes }) {
    return (
        <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <MessageSquare size={12}/> Patient Notes
            </p>
            <p className="text-sm font-medium text-slate-700">"{notes}"</p>
        </div>
    );
}

function SectionLabel({ children }) {
    return <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-3">{children}</p>;
}

function FormField({ label, children }) {
    return (
        <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
            {children}
        </div>
    );
}

function ErrorBanner({ msg }) {
    return (
        <div className="flex items-center gap-3 p-3.5 bg-red-50 rounded-2xl border border-red-100">
            <AlertCircle size={15} className="text-red-500 flex-shrink-0"/>
            <p className="text-xs font-bold text-red-600">{msg}</p>
        </div>
    );
}

function ModalButtons({ onCancel, loading, loadingLabel, submitLabel, submitIcon, submitClass }) {
    return (
        <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel}
                className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all">
                Cancel
            </button>
            <button type="submit" disabled={loading}
                className={`flex-1 py-3.5 bg-gradient-to-r ${submitClass} text-white rounded-2xl text-sm font-black transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2`}>
                {loading
                    ? <><RefreshCw size={14} className="animate-spin"/>{loadingLabel}</>
                    : <>{submitIcon}{submitLabel}</>}
            </button>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="py-16 text-center text-slate-400">
            <CalendarDays size={44} className="mx-auto mb-3 opacity-10"/>
            <p className="text-xs font-bold uppercase tracking-widest">No appointments found</p>
        </div>
    );
}