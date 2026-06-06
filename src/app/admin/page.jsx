'use client';
import { useState, useEffect } from 'react';
import { 
    Users, 
    Calendar, 
    MessageSquare, 
    TrendingUp, 
    ArrowRight, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    UserPlus,
    CalendarDays,
    ChevronRight,
    Phone,
    Activity,
    XCircle
} from 'lucide-react';
import apiService from '@/services/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, [isAdmin]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = isAdmin 
                ? await apiService.getAdminDashboard()
                : await apiService.getDoctorDashboard();
                
            if (response.status === 401) {
                router.push('/admin/login');
                return;
            }
            const result = await response.json();
            if (response.ok) {
                setData(result);
            } else {
                setError(result.message || 'Failed to load dashboard data');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse p-1">
                {/* Header skeleton */}
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-slate-200 rounded-lg" />
                    <div className="h-4 w-64 bg-slate-100 rounded-md" />
                </div>
                
                {/* Cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-white rounded-3xl border border-slate-100 p-6 flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex-shrink-0" />
                            <div className="space-y-2 w-full">
                                <div className="h-3 w-16 bg-slate-200 rounded" />
                                <div className="h-6 w-12 bg-slate-200 rounded" />
                                <div className="h-3 w-24 bg-slate-100 rounded" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main grid skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-[500px] bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <div className="h-5 w-36 bg-slate-200 rounded" />
                                <div className="h-3 w-24 bg-slate-100 rounded" />
                            </div>
                            <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                        </div>
                        <div className="space-y-3 pt-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-16 bg-slate-50 rounded-2xl" />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="h-60 bg-white rounded-3xl border border-slate-100 animate-pulse" />
                        <div className="h-80 bg-white rounded-3xl border border-slate-100 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-[32px] border border-red-100/80 shadow-xl shadow-red-50/50 max-w-lg mx-auto my-12 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-5 border border-red-100">
                    <AlertCircle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">System Disconnected</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
                    {error || 'We experienced an issue fetching the latest dashboard statistics. Please ensure your connection is active.'}
                </p>
                <button 
                    onClick={fetchDashboardData} 
                    className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-100 hover:scale-[1.02] cursor-pointer"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (isAdmin) {
        return (
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span>Clinic Control Center</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Real-time clinical performance metrics</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        icon={CalendarDays} 
                        label="Today's Appts" 
                        value={data?.stats?.appointments?.today || 0} 
                        subValue={`${data?.stats?.appointments?.pending || 0} Pending Approval`}
                        color="blue"
                    />
                    <StatCard 
                        icon={Users} 
                        label="Active Doctors" 
                        value={data?.stats?.doctors?.active || 0} 
                        subValue={`Total of ${data?.stats?.doctors?.total || 0} Registered`}
                        color="emerald"
                    />
                    <StatCard 
                        icon={MessageSquare} 
                        label="New Inquiries" 
                        value={data?.stats?.contacts?.new || 0} 
                        subValue={`Total of ${data?.stats?.contacts?.total || 0} Inquiries`}
                        color="amber"
                    />
                </div>

                {/* Quick Actions & Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Today's Appointments */}
                    <div className="lg:col-span-2 bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Today's Appointments</h3>
                                <p className="text-xs text-slate-400 tracking-wide mt-0.5">Scheduled patient visits</p>
                            </div>
                            <button onClick={() => router.push('/admin/appointments')} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded-2xl transition-all duration-300 shadow-sm hover:shadow cursor-pointer">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                        <div className="flex-1">
                            {data.today_appointments?.length > 0 ? (
                                <>
                                    {/* Desktop View (Table) */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/50">
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Doctor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100/60">
                                                {data.today_appointments.map((appt) => (
                                                    <tr key={appt.id} className="hover:bg-slate-50/40 transition-colors duration-200">
                                                        <td className="px-6 py-4.5">
                                                            <p className="text-sm font-semibold text-slate-800">{appt.patient_name}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">{appt.service || 'General Dental'}</p>
                                                        </td>
                                                        <td className="px-6 py-4.5">
                                                            <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                                                                <Clock size={14} className="stroke-[2.5]" />
                                                                <span className="text-xs">{appt.start_time}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4.5">
                                                            <StatusBadge status={appt.status} />
                                                        </td>
                                                        <td className="px-6 py-4.5 text-sm font-semibold text-slate-600">
                                                            {appt.doctor || 'Unassigned'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile View (Cards list) */}
                                    <div className="block md:hidden p-6 space-y-4">
                                        {data.today_appointments.map((appt) => (
                                            <div key={appt.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3 relative hover:border-blue-100 transition-colors duration-200">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{appt.patient_name}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{appt.service || 'General Dental'}</p>
                                                    </div>
                                                    <StatusBadge status={appt.status} />
                                                </div>
                                                <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100/70 text-xs text-slate-600">
                                                    <div className="flex items-center gap-1 text-blue-600 font-semibold">
                                                        <Clock size={13} />
                                                        <span>{appt.start_time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-slate-500 font-semibold">
                                                        <Users size={13} />
                                                        <span>{appt.doctor || 'Unassigned'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 px-6 text-center text-slate-400">
                                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100/60">
                                        <Calendar size={24} className="text-slate-300 stroke-[1.5]" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">No Appointments Scheduled</p>
                                    <p className="text-xs text-slate-400 mt-1 max-w-xs">There are no appointments booked for today. You can check upcoming bookings via the action panel.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Recent Contacts & Chart */}
                    <div className="space-y-8">
                        
                        {/* Booking Trend */}
                        <ChartCard data={data.chart_last_7_days} />

                        {/* Activity Log */}
                        <ActivityFeedCard activities={data.recent_activities} />

                        {/* Recent Contacts */}
                        <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Inquiries</h3>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Contact submissions</p>
                                </div>
                                <button 
                                    onClick={() => router.push('/admin/contacts')} 
                                    className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors bg-blue-50/50 border border-blue-100/30 px-3 py-1.5 rounded-xl cursor-pointer"
                                >
                                    View All
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {data.recent_contacts && data.recent_contacts.length > 0 ? (
                                    data.recent_contacts.map((contact) => (
                                        <div 
                                            key={contact.id} 
                                            className="flex items-center gap-3.5 group cursor-pointer p-2.5 rounded-2xl hover:bg-slate-50/70 border border-transparent hover:border-slate-100 transition-all duration-300" 
                                            onClick={() => router.push('/admin/contacts')}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-transform duration-300 group-hover:scale-105 shadow-sm ${contact.status === 'new' ? 'bg-amber-500/8 text-amber-600 border-amber-105' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                <MessageSquare size={16} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{contact.name}</p>
                                                <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{contact.email}</p>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-slate-400 py-8 flex flex-col items-center justify-center">
                                        <MessageSquare size={28} className="opacity-20 mb-2" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">No recent inquiries</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Link Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => router.push('/admin/doctors')} 
                                className="group p-5 bg-slate-900 text-white rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-slate-800 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-1 group-hover:scale-110 transition-transform duration-300">
                                    <UserPlus size={18} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Add Doctor</span>
                            </button>
                            <button 
                                onClick={() => router.push('/admin/services')} 
                                className="group p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl flex flex-col items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.02] cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white mb-1 group-hover:scale-110 transition-transform duration-300">
                                    <CheckCircle2 size={18} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Services</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- DOCTOR VIEW ---
    const doctorStats = data?.stats || {};
    const doctor = data?.doctor || {};
    const schedule = data?.schedule || {};

    return (
        <div className="space-y-10 pb-20">
            {/* Greeting & Quick Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        <span>Doctor Portal</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dr. {doctor.name?.split(' ')[0]}</span>!
                    </h1>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold">{doctor.specialization || 'Dental Specialist'}</span>
                        <span>•</span>
                        <span>Online Consultation Desk</span>
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => router.push('/admin/appointments')} className="flex-1 sm:flex-none px-5 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all duration-300 shadow-sm cursor-pointer hover:scale-[1.01]">
                        Appointments
                    </button>
                    <button onClick={() => router.push('/admin/schedule')} className="flex-1 sm:flex-none px-5 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all duration-300 shadow-sm cursor-pointer hover:scale-[1.01]">
                        Schedule
                    </button>
                    <button onClick={() => router.push('/admin/profile')} className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-blue-500/15 transition-all duration-300 cursor-pointer hover:scale-[1.02]">
                        My Profile
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <MiniStat label="Today" value={doctorStats.today_appointments} color="blue" />
                <MiniStat label="Upcoming" value={doctorStats.upcoming_appointments} color="indigo" />
                <MiniStat label="Pending" value={doctorStats.pending} color="amber" />
                <MiniStat label="Confirmed" value={doctorStats.confirmed} color="emerald" />
                <MiniStat label="Monthly Complete" value={doctorStats.completed_this_month} color="slate" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Dashboard Column */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Next Appointment Hero */}
                    {data.next_appointment && (
                        <div className="p-6 md:p-8 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 rounded-[32px] text-white shadow-xl shadow-blue-500/10 relative overflow-hidden group">
                            {/* Decorative Background Icon */}
                            <div className="absolute top-1/2 -translate-y-1/2 -right-4 opacity-5 group-hover:opacity-10 group-hover:scale-105 transition-all duration-700 pointer-events-none">
                                <CalendarDays size={200} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                                    <div className="flex items-center gap-2.5">
                                        <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[9px] font-extrabold uppercase tracking-widest border border-white/10">Next Up</span>
                                        <span className="text-xs font-semibold text-blue-100">{data.next_appointment.time_until ? `In ${data.next_appointment.time_until}` : 'Starts soon'}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-blue-200/80 uppercase tracking-widest">{new Date(data.next_appointment.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                </div>
                                
                                <h2 className="text-2xl md:text-3xl font-extrabold mb-1">{data.next_appointment.patient_name}</h2>
                                <p className="text-blue-100 text-sm font-semibold mb-6 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                                    {data.next_appointment.service || 'General Consultation'}
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-200 shrink-0">
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-blue-200 uppercase font-bold tracking-wider">Scheduled Time</p>
                                            <p className="font-bold">{data.next_appointment.start_time} — {data.next_appointment.end_time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-200 shrink-0">
                                            <Phone size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-blue-200 uppercase font-bold tracking-wider">Contact Number</p>
                                            <p className="font-bold">{data.next_appointment.patient_phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Today's Full List */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Today's List</h3>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{data.today_appointments?.length || 0} Scheduled</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {data.today_appointments?.length > 0 ? (
                                data.today_appointments.map(appt => (
                                    <AppointmentRow key={appt.id} appt={appt} />
                                ))
                            ) : (
                                <div className="p-12 text-center bg-slate-50 border border-slate-100 rounded-[32px] text-slate-400">
                                    <Clock size={36} className="mx-auto mb-3 opacity-20 text-slate-400" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Your afternoon is free</p>
                                    <p className="text-[11px] text-slate-400 mt-1">No scheduled slots for today.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Upcoming List */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Days</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {data.upcoming_appointments?.slice(0, 3).map(appt => (
                                <AppointmentRow key={appt.id} appt={appt} isUpcoming />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Schedule Card */}
                    <div className="bg-white p-6 md:p-8 rounded-[28px] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 tracking-tight">Your Schedule</h3>
                                <p className="text-[10px] text-slate-400 mt-0.5">Availability status</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-500 shadow-sm">
                                <Clock size={18} />
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="p-4 bg-slate-50 border border-slate-100/40 rounded-2xl">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Today's Capacity</p>
                                <p className="text-lg font-bold text-slate-800">{schedule.today_slot_count || 0} Available Slots</p>
                            </div>
                            <div className="space-y-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100/50 shrink-0">
                                        <CheckCircle2 size={13} className="stroke-[2.5]" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600">{schedule.using_default_schedule ? 'Using regular clinic schedule' : 'Custom personal schedule'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                                        <Calendar size={13} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600">{schedule.default_schedule?.hours || '09:00 AM - 05:00 PM'}</span>
                                </div>
                            </div>
                            
                            {/* Blocked Dates */}
                            {schedule.upcoming_blocked_dates?.length > 0 && (
                                <div className="pt-5 border-t border-slate-100/60">
                                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        Planned Leaves
                                    </p>
                                    <div className="space-y-2.5">
                                        {schedule.upcoming_blocked_dates.map(bd => (
                                            <div key={bd.id} className="flex items-center gap-3 text-xs font-semibold text-slate-500 bg-red-50/30 border border-red-100/30 p-2.5 rounded-xl">
                                                <AlertCircle size={14} className="text-red-400 shrink-0" />
                                                <div className="min-w-0">
                                                    <span className="text-slate-700">{new Date(bd.blocked_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                                    {bd.reason && <span className="text-slate-400 block text-[10px] mt-0.5 truncate">• {bd.reason}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chart Card */}
                    <ChartCard data={data.chart_last_7_days} />
                </div>
            </div>
        </div>
    );
}

function MiniStat({ label, value, color }) {
    const colors = {
        blue: { text: 'text-blue-600', bg: 'bg-blue-50/50 border-blue-100/40' },
        emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100/40' },
        amber: { text: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100/40' },
        indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50/50 border-indigo-100/40' },
        slate: { text: 'text-slate-600', bg: 'bg-slate-50/50 border-slate-200/40' }
    };

    const theme = colors[color] || colors.blue;

    return (
        <div className={`group bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300 text-center flex flex-col justify-center items-center relative hover:scale-[1.02]`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h4 className={`text-2xl font-extrabold ${theme.text} leading-none mt-1`}>{value ?? 0}</h4>
            <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl border-b-2 opacity-0 group-hover:opacity-100 transition-opacity duration-350 ${theme.text}`} />
        </div>
    );
}

function AppointmentRow({ appt, isUpcoming }) {
    return (
        <div className="p-4 md:p-5 bg-white border border-slate-100/80 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
            <div className="flex items-center gap-4 min-w-0">
                {/* Avatar bubble */}
                <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center text-sm font-bold shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 border border-slate-100 transition-colors">
                    {appt.patient_name?.charAt(0) || 'P'}
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-800 truncate leading-none">{appt.patient_name}</h4>
                        <StatusBadge status={appt.status} />
                    </div>
                    <p className="text-xs text-slate-400 font-medium truncate">{appt.service || 'General Dental Treatment'}</p>
                    {appt.patient_notes && (
                        <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1 border-l-2 border-slate-200 pl-1.5">
                            "{appt.patient_notes}"
                        </p>
                    )}
                </div>
            </div>
            
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-2 sm:pt-0 border-t border-slate-50 sm:border-0 shrink-0 gap-1">
                <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                    <Clock size={13} className="stroke-[2.5]" />
                    <span className="text-[11px]">{appt.start_time}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                    {isUpcoming ? new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
                </span>
            </div>
        </div>
    );
}

function ChartCard({ data }) {
    const maxCount = Math.max(...(data?.map(item => item.count) || []), 1);

    return (
        <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Booking Trends</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Last 7 days clinical activity</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-500 shadow-sm">
                    <TrendingUp size={18} />
                </div>
            </div>
            
            <div className="h-32 flex items-end justify-between gap-3 px-1 mt-8">
                {data?.map((item, i) => {
                    const heightPct = (item.count / maxCount) * 85 + 15; // scales between 15% and 100%
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3.5 group relative">
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-1 group-hover:-translate-y-0 z-20">
                                <span className="bg-slate-900 text-white text-[9px] font-bold py-1 px-2 rounded-lg shadow-md whitespace-nowrap block">
                                    {item.count} Appt{item.count !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Bar */}
                            <div 
                                className="w-full bg-slate-50 hover:bg-gradient-to-t hover:from-blue-500 hover:to-indigo-600 rounded-t-xl rounded-b-sm transition-all duration-300 cursor-pointer border-t border-slate-100 hover:border-transparent"
                                style={{ 
                                    height: `${heightPct}%`,
                                    background: item.count > 0 ? undefined : '#f8fafc' 
                                }}
                            >
                                {item.count > 0 && (
                                    <div className="w-full h-full bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t-xl rounded-b-sm group-hover:opacity-0 transition-opacity duration-300" />
                                )}
                            </div>

                            {/* Date Label */}
                            <span className="text-[9px] font-semibold text-slate-400 tracking-wide uppercase transition-colors group-hover:text-blue-600">
                                {item.date}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, subValue, color }) {
    const colorConfigs = {
        blue: {
            text: 'text-blue-600',
            border: 'hover:border-blue-200/80',
            glow: 'hover:shadow-blue-500/5',
            iconBg: 'bg-blue-500/8',
        },
        emerald: {
            text: 'text-emerald-600',
            border: 'hover:border-emerald-200/80',
            glow: 'hover:shadow-emerald-500/5',
            iconBg: 'bg-emerald-500/8',
        },
        amber: {
            text: 'text-amber-600',
            border: 'hover:border-amber-200/80',
            glow: 'hover:shadow-amber-500/5',
            iconBg: 'bg-amber-500/8',
        }
    };
    
    const config = colorConfigs[color] || colorConfigs.blue;

    return (
        <div className={`group bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md ${config.glow} ${config.border} transition-all duration-300 flex items-center gap-5 hover:scale-[1.01]`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.iconBg} ${config.text} transition-transform duration-300 group-hover:scale-105 shrink-0`}>
                <Icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none">{value}</h2>
                </div>
                <p className="text-xs font-semibold text-slate-400 mt-1.5 flex items-center gap-1.5 truncate">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                    {subValue}
                </p>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        pending: 'bg-amber-500/8 text-amber-600 border-amber-500/20',
        confirmed: 'bg-emerald-500/8 text-emerald-600 border-emerald-500/20',
        rejected: 'bg-red-500/8 text-red-600 border-red-500/20',
        rescheduled: 'bg-blue-500/8 text-blue-600 border-blue-500/20',
        completed: 'bg-slate-500/8 text-slate-605 border-slate-500/20',
        cancelled: 'bg-slate-500/8 text-slate-400 border-slate-500/20',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles[status] || styles.pending}`}>
            {status}
        </span>
    );
}

function ActivityFeedCard({ activities }) {
    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatActionIcon = (action) => {
        switch (action?.toLowerCase()) {
            case 'booked': return <CalendarDays size={14} className="text-blue-600" />;
            case 'confirmed': return <CheckCircle2 size={14} className="text-emerald-600" />;
            case 'rejected': return <XCircle size={14} className="text-red-600" />;
            case 'rescheduled': return <CalendarDays size={14} className="text-amber-600" />;
            case 'contacted': return <UserPlus size={14} className="text-purple-600" />;
            case 'completed': return <CheckCircle2 size={14} className="text-slate-600" />;
            default: return <Activity size={14} className="text-slate-600" />;
        }
    };

    const formatIconBg = (action) => {
        switch (action?.toLowerCase()) {
            case 'booked': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            case 'rescheduled': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'contacted': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'completed': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Activity Log</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Real-time system updates</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-500 shadow-sm">
                    <Activity className="animate-pulse" size={18} />
                </div>
            </div>
            
            <div className="relative pl-3 max-h-[340px] overflow-y-auto pr-1 space-y-5 scrollbar-thin">
                {activities && activities.length > 1 && (
                    <div className="absolute left-[23px] top-4 bottom-4 w-[2px] bg-dashed border-l border-slate-100 pointer-events-none" />
                )}

                {activities && activities.length > 0 ? (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4 items-start group relative">
                            {/* Bullet icon */}
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 z-10 transition-transform duration-300 group-hover:scale-105 shadow-sm ${formatIconBg(activity.action)}`}>
                                {formatActionIcon(activity.action)}
                            </div>
                            
                            <div className="flex-1 min-w-0 pb-1">
                                <p className="text-xs font-semibold text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">
                                    {activity.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                        <Clock size={10} />
                                        {formatTime(activity.created_at)}
                                    </span>
                                    {activity.user && (
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase tracking-widest border border-blue-100/50">
                                            {activity.user.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-slate-400 py-12 flex flex-col items-center justify-center">
                        <Activity size={32} className="opacity-20 mb-3" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No activity recorded</p>
                    </div>
                )}
            </div>
        </div>
    );
}
