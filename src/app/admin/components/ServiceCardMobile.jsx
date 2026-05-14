import { Clock, IndianRupee } from 'lucide-react';

export default function ServiceCardMobile({ service }) {
    return (
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-colors">
            {/* Status Line */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${service.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />

            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-600 font-black text-xl">
                            {service.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-800 leading-tight">
                            {service.name}
                        </h3>
                        <div className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${service.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="mt-4">
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {service.description || 'No description provided'}
                </p>
            </div>

            {/* Bottom Stats */}
            <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                        <Clock size={14} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                        <p className="text-sm font-black text-slate-700">{service.duration_minutes} min</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <IndianRupee size={14} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</p>
                        <p className="text-sm font-black text-slate-700">₹{service.price}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
