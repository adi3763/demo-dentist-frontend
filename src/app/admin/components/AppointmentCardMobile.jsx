import { RefreshCw, Clock, Calendar as CalIcon } from 'lucide-react';

export default function AppointmentCardMobile({ appt }) {
    return (
        <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                        {appt.patient.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 leading-tight">{appt.patient}</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {appt.id}</span>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${appt.dotColor.replace('bg-', 'text-').replace('-500', '-600')} ${appt.dotColor.replace('bg-', 'bg-')}/10`}>
                    {appt.dept}
                </div>
            </div>

            <div className="space-y-3 py-4 border-y border-slate-50">
                <div className="flex items-center gap-3 text-slate-500">
                    <CalIcon size={14} />
                    <span className="text-xs font-bold">{appt.date}</span>
                    <span className="text-slate-300">|</span>
                    <Clock size={14} />
                    <span className="text-xs font-bold">{appt.time}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${appt.dotColor}`}></span>
                    <span className="text-xs font-bold text-slate-600">{appt.doctor}</span>
                </div>
            </div>

            <button className="w-full mt-4 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-slate-200">
                <RefreshCw size={14} />
                Reschedule Appointment
            </button>
        </div>
    );
}