import { MoreVertical, Phone, Mail, ArrowUpRight } from 'lucide-react';

export default function DoctorCardMobile({ doctor }) {
    const specStyles = {
        Cardiology: "bg-blue-50 text-blue-600",
        Neurology: "bg-purple-50 text-purple-600",
        Orthopedics: "bg-orange-50 text-orange-600",
        Pediatrics: "bg-emerald-50 text-emerald-600",
    };

    return (
        <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm active:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img
                            src={doctor.image}
                            className="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-50"
                            alt={doctor.name}
                        />
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${doctor.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{doctor.name}</h3>
                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${specStyles[doctor.specialization]}`}>
                            {doctor.specialization}
                        </span>
                    </div>
                </div>
                <button className="p-2 text-slate-300">
                    <MoreVertical size={20} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
                <a href={`tel:${doctor.phone}`} className="flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-2xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <Phone size={16} />
                    <span className="text-xs font-bold uppercase tracking-tighter">Call</span>
                </a>
                <button className="flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-2xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <ArrowUpRight size={16} />
                    <span className="text-xs font-bold uppercase tracking-tighter">Details</span>
                </button>
            </div>
        </div>
    );
}