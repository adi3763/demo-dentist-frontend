export default function ServiceRow({ service }) {
    return (
        <tr className="hover:bg-slate-50/50 transition-colors group">
            {/* Name & Description */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-600 font-black text-lg">
                            {service.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">{service.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">
                            {service.description || 'No description provided'}
                        </p>
                    </div>
                </div>
            </td>

            {/* Price */}
            <td className="px-6 py-4">
                <p className="text-sm font-black text-slate-700">₹{service.price}</p>
            </td>

            {/* Duration */}
            <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-blue-50 text-blue-600">
                    {service.duration_minutes} min
                </span>
            </td>

            {/* Status */}
            <td className="px-6 py-4">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${service.is_active ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${service.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    {service.is_active ? 'Active' : 'Inactive'}
                </div>
            </td>

            {/* View hint (if we add details modal later) */}
            <td className="px-6 py-4 text-right">
                {/* Placeholder for actions */}
            </td>
        </tr>
    );
}
