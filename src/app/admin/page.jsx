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
    CalendarDays
} from 'lucide-react';
import apiService from '@/services/api';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await apiService.getAdminDashboard();
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

    const stats = data?.stats || {};

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
                    value={stats.appointments?.today || 0} 
                    subValue={`${stats.appointments?.pending || 0} Pending`}
                    color="blue"
                />
                <StatCard 
                    icon={Users} 
                    label="Active Doctors" 
                    value={stats.doctors?.active || 0} 
                    subValue={`Total ${stats.doctors?.total || 0}`}
                    color="emerald"
                />
                <StatCard 
                    icon={MessageSquare} 
                    label="New Inquiries" 
                    value={stats.contacts?.new || 0} 
                    subValue={`Total ${stats.contacts?.total || 0}`}
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
                    
                    {/* Booking Trend (Placeholder for chart) */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-black text-slate-900 tracking-tight">Booking Trend</h3>
                            <TrendingUp className="text-emerald-500" size={20} />
                        </div>
                        <div className="h-32 flex items-end justify-between gap-2 px-2">
                            {data.chart_last_7_days?.map((item, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div 
                                        className="w-full bg-blue-100 rounded-lg group-hover:bg-blue-600 transition-all cursor-pointer"
                                        style={{ height: `${Math.max((item.count / 10) * 100, 10)}%` }}
                                        title={`${item.count} bookings on ${item.date}`}
                                    />
                                    <span className="text-[8px] font-black text-slate-400 uppercase">{item.date.split('-')[2]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

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

function ChevronRight({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m9 18 6-6-6-6"/>
        </svg>
    );
}
