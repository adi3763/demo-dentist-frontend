import { RefreshCw } from 'lucide-react';

export default function AppointmentRow({ appt }) {
  // Get initials for the avatar
  const initials = appt.patient.split(' ').map(n => n[0]).join('');

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-500 border border-slate-200">
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{appt.patient}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {appt.id}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${appt.dotColor}`}></span>
          <span className="text-sm font-semibold text-slate-600">{appt.doctor}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <div>
          <p className="text-sm font-bold text-slate-800">{appt.date}</p>
          <p className="text-[10px] font-bold text-slate-400">{appt.time}</p>
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm">
          <RefreshCw size={14} />
          Reschedule
        </button>
      </td>
    </tr>
  );
}