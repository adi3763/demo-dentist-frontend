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
            <div className="space-y-8 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-[32px] border border-slate-100" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="h-96 bg-white rounded-[40px] border border-slate-100" />
                    <div className="h-96 bg-white rounded-[40px] border border-slate-100" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-red-100">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Dashboard Error</h3>
                <p className="text-sm font-bold text-slate-400 mt-1">{error}</p>
                <button onClick={fetchDashboardData} className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all">
                    Retry Loading
                </button>
            </div>
        );
    }

    if (isAdmin) {
        return (
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overview</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time clinical performance metrics</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        icon={CalendarDays} 
                        label="Today's Appts" 
                        value={data?.stats?.appointments?.today || 0} 
                        subValue={`${data?.stats?.appointments?.pending || 0} Pending`}
                        color="blue"
                    />
                    <StatCard 
                        icon={Users} 
                        label="Active Doctors" 
                        value={data?.stats?.doctors?.active || 0} 
                        subValue={`Total ${data?.stats?.doctors?.total || 0}`}
                        color="emerald"
                    />
                    <StatCard 
                        icon={MessageSquare} 
                        label="New Inquiries" 
                        value={data?.stats?.contacts?.new || 0} 
                        subValue={`Total ${data?.stats?.contacts?.total || 0}`}
                        color="amber"
                    />
                </div>

                {/* Quick Actions & Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Today's Appointments */}
                    <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Today's Appointments</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Scheduled patient visits</p>
                            </div>
                            <button onClick={() => router.push('/admin/appointments')} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-blue-600">
                                <ArrowRight size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-x-auto">
                            {data.today_appointments?.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data.today_appointments.map((appt) => (
                                            <tr key={appt.id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-8 py-5">
                                                    <p className="text-sm font-bold text-slate-800">{appt.patient_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{appt.service || 'Dental'}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-blue-600">
                                                        <Clock size={14} />
                                                        <span className="text-xs font-bold">{appt.start_time}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <StatusBadge status={appt.status} />
                                                </td>
                                                <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                                    {appt.doctor || 'Unassigned'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                    <Calendar size={48} className="mb-4 opacity-20" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No appointments today</p>
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
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base font-black text-slate-900 tracking-tight">Recent Inquiries</h3>
                                <button onClick={() => router.push('/admin/contacts')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</button>
                            </div>
                            <div className="space-y-4">
                                {data.recent_contacts?.map((contact) => (
                                    <div key={contact.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push('/admin/contacts')}>
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${contact.status === 'new' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'}`}>
                                            <MessageSquare size={18} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-slate-800 truncate">{contact.name}</p>
                                            <p className="text-[10px] font-medium text-slate-400 truncate">{contact.email}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Link Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => router.push('/admin/doctors')} className="p-4 bg-slate-900 text-white rounded-3xl flex flex-col items-center gap-2 hover:bg-slate-800 transition-all">
                                <UserPlus size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Add Doctor</span>
                            </button>
                            <button onClick={() => router.push('/admin/services')} className="p-4 bg-blue-600 text-white rounded-3xl flex flex-col items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                                <CheckCircle2 size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Services</span>
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Hello, Dr. {doctor.name?.split(' ')[0]}!</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{doctor.specialization || 'Medical Specialist'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/admin/appointments')} className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">View Appointments</button>
                    <button onClick={() => router.push('/admin/schedule')} className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">Manage Schedule</button>
                    <button onClick={() => router.push('/admin/profile')} className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">My Profile</button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <MiniStat label="Today" value={doctorStats.today_appointments} color="blue" />
                <MiniStat label="Upcoming" value={doctorStats.upcoming_appointments} color="indigo" />
                <MiniStat label="Pending" value={doctorStats.pending} color="amber" />
                <MiniStat label="Confirmed" value={doctorStats.confirmed} color="emerald" />
                <MiniStat label="Monthly" value={doctorStats.completed_this_month} color="slate" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Dashboard Column */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Next Appointment Hero */}
                    {data.next_appointment && (
                        <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[48px] text-white shadow-2xl shadow-blue-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <CalendarDays size={180} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest">Next Up</div>
                                    <div className="text-xs font-bold text-blue-100">Starts in {data.next_appointment.time_until || 'a few minutes'}</div>
                                </div>
                                <h2 className="text-3xl font-black mb-1">{data.next_appointment.patient_name}</h2>
                                <p className="text-blue-100 font-bold mb-8">{data.next_appointment.service || 'General Consultation'}</p>
                                
                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <Clock size={18} className="text-blue-300" />
                                        <span className="text-sm font-black">{data.next_appointment.start_time} — {data.next_appointment.end_time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={18} className="text-blue-300" />
                                        <span className="text-sm font-black">{data.next_appointment.patient_phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Today's Full List */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Today's List</h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.today_appointments?.length || 0} Scheduled</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {data.today_appointments?.length > 0 ? (
                                data.today_appointments.map(appt => (
                                    <AppointmentRow key={appt.id} appt={appt} />
                                ))
                            ) : (
                                <div className="p-12 text-center bg-slate-50 border border-slate-100 rounded-[40px] text-slate-300">
                                    <Clock size={40} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Your afternoon is free</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Upcoming List */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Upcoming Days</h3>
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
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-black text-slate-900 tracking-tight">Your Schedule</h3>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Clock size={18} />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50 rounded-3xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Today's Capacity</p>
                                <p className="text-lg font-black text-slate-800">{schedule.today_slot_count || 0} Available Slots</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                    <span className="text-xs font-bold text-slate-600">{schedule.using_default_schedule ? 'Using regular clinic schedule' : 'Custom personal schedule'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-600">{schedule.default_schedule?.hours || '09:00 AM - 05:00 PM'}</span>
                                </div>
                            </div>
                            
                            {/* Blocked Dates */}
                            {schedule.upcoming_blocked_dates?.length > 0 && (
                                <div className="pt-6 border-t border-slate-50">
                                    <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-3">Planned Leaves</p>
                                    <div className="space-y-2">
                                        {schedule.upcoming_blocked_dates.map(bd => (
                                            <div key={bd.id} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                                <AlertCircle size={14} className="text-red-300" />
                                                <span>{new Date(bd.blocked_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                {bd.reason && <span className="opacity-50">• {bd.reason}</span>}
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
        blue: 'text-blue-600',
        emerald: 'text-emerald-600',
        amber: 'text-amber-600',
        indigo: 'text-indigo-600',
        slate: 'text-slate-600'
    };
    return (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h4 className={`text-xl font-black ${colors[color]}`}>{value || 0}</h4>
        </div>
    );
}

function AppointmentRow({ appt, isUpcoming }) {
    return (
        <div className="p-5 bg-white border border-slate-100 rounded-[32px] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all flex items-center gap-6 group">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-lg font-black group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                {appt.patient_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-black text-slate-800 truncate">{appt.patient_name}</h4>
                    <StatusBadge status={appt.status} />
                </div>
                <p className="text-xs font-bold text-slate-400 truncate">{appt.service || 'General Dental Treatment'}</p>
                {appt.patient_notes && <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1">"{appt.patient_notes}"</p>}
            </div>
            <div className="text-right flex-shrink-0">
                <div className="flex items-center justify-end gap-2 text-blue-600 font-black mb-0.5">
                    <Clock size={14} strokeWidth={3} />
                    <span className="text-[11px]">{appt.start_time}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400">
                    {isUpcoming ? new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
                </p>
            </div>
        </div>
    );
}

function ChartCard({ data }) {
    return (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-black text-slate-900 tracking-tight">Booking Trends</h3>
                <TrendingUp className="text-emerald-500" size={20} />
            </div>
            <div className="h-32 flex items-end justify-between gap-2 px-2">
                {data?.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div 
                            className="w-full bg-blue-100 rounded-lg group-hover:bg-blue-600 transition-all cursor-pointer"
                            style={{ height: `${Math.max((item.count / 10) * 100, 10)}%` }}
                            title={`${item.count} appointments on ${item.date}`}
                        />
                        <span className="text-[8px] font-black text-slate-400 uppercase">{item.date.split('-')[2]}</span>
                    </div>
                ))}
            </div>
            <p className="text-[10px] font-bold text-slate-400 text-center mt-4 uppercase tracking-widest">Appointments / Last 7 Days</p>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, subValue, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600'
    };
    return (
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center ${colors[color]}`}>
                <Icon size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <h2 className="text-2xl font-black text-slate-900 leading-none">{value}</h2>
                <p className="text-[10px] font-bold text-slate-400 mt-1">{subValue}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        pending: 'bg-amber-50 text-amber-600 border-amber-100',
        confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        rejected: 'bg-red-50 text-red-600 border-red-100',
        rescheduled: 'bg-blue-50 text-blue-600 border-blue-100',
        completed: 'bg-slate-50 text-slate-500 border-slate-100',
        cancelled: 'bg-slate-50 text-slate-400 border-slate-100',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || styles.pending}`}>
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
            case 'booked': return <CalendarDays size={14} className="text-blue-500" />;
            case 'confirmed': return <CheckCircle2 size={14} className="text-emerald-500" />;
            case 'rejected': return <XCircle size={14} className="text-red-500" />;
            case 'rescheduled': return <CalendarDays size={14} className="text-amber-500" />;
            case 'contacted': return <UserPlus size={14} className="text-purple-500" />;
            case 'completed': return <CheckCircle2 size={14} className="text-slate-500" />;
            default: return <Activity size={14} className="text-slate-500" />;
        }
    };

    return (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-black text-slate-900 tracking-tight">Activity Log</h3>
                <Activity className="text-blue-500" size={20} />
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {activities && activities.length > 0 ? (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 mt-1">
                                {formatActionIcon(activity.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 leading-snug">{activity.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatTime(activity.created_at)}</span>
                                    {activity.user && (
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase tracking-widest">
                                            {activity.user.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-slate-400 py-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest">No recent activity</p>
                    </div>
                )}
            </div>
        </div>
    );
}

