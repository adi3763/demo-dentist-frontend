import { Activity, CalendarDays, User, CheckCircle2, XCircle } from 'lucide-react';

export default function RightPanel({ activities = [] }) {
    // Helper function to format timestamp
    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatActionIcon = (action) => {
        switch (action?.toLowerCase()) {
            case 'booked': return <CalendarDays size={14} className="text-blue-500" />;
            case 'confirmed': return <CheckCircle2 size={14} className="text-green-500" />;
            case 'rejected': return <XCircle size={14} className="text-red-500" />;
            case 'rescheduled': return <CalendarDays size={14} className="text-orange-500" />;
            case 'contacted': return <User size={14} className="text-purple-500" />;
            case 'completed': return <CheckCircle2 size={14} className="text-indigo-500" />;
            default: return <Activity size={14} className="text-slate-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800">Recent Activity</h3>
                    <Activity size={16} className="text-slate-300" />
                </div>

                <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {activities.length > 0 ? (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex gap-3 items-start">
                                <div className="mt-0.5">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                                        {formatActionIcon(activity.action)}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-700 leading-snug">{activity.description}</p>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {formatTime(activity.created_at)}
                                        </span>
                                        {activity.user && (
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-600">
                                                {activity.user.name} ({activity.user.role})
                                            </span>
                                        )}
                                        {!activity.user && (
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                                                Patient
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-slate-500 text-sm py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            No recent activity found.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}