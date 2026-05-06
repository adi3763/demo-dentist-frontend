export default function AppointmentItem({ name, id, time, dr, status }) {
    const statusColors = {
        'Confirmed': 'bg-emerald-50 text-emerald-600',
        'In Progress': 'bg-blue-50 text-blue-600',
        'Waiting': 'bg-orange-50 text-orange-600',
        'Cancelled': 'bg-red-50 text-red-600'
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all items-center">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <p className="font-bold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-400 font-medium">{id}</p>
                </div>
            </div>

            <div className="text-sm font-semibold text-slate-600 lg:block flex justify-between">
                <span className="lg:hidden text-slate-400">Time:</span> {time}
            </div>

            <div className="text-sm font-semibold text-slate-600 lg:block flex justify-between">
                <span className="lg:hidden text-slate-400">Doctor:</span> {dr}
            </div>

            <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[status]}`}>
                    {status}
                </span>
                <button className="text-slate-300 hover:text-slate-600 lg:block hidden">•••</button>
            </div>
        </div>
    );
}