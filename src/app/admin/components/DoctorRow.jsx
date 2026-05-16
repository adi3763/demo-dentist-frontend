export default function DoctorRow({ doctor, onClick, isAdmin, onToggle, toggling }) {
    const p = doctor.profile || {};
    const isActive = doctor.is_active ?? (doctor.status === 'active' || doctor.status === 'Active');
    const specialization = p.specialization || doctor.specialization || 'General';
    const phoneNumber = doctor.phone || p.phone || doctor.phone_number || p.phone_number || '—';

    const rawPhoto = p.photo || doctor.photo || doctor.image;
    const avatarUrl = rawPhoto 
        ? (rawPhoto.startsWith('http') ? rawPhoto : `https://demo-dentist-main-adaeep.free.laravel.cloud/storage/${rawPhoto}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'D')}&background=0D8ABC&color=fff`;

    return (
        <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={onClick}>

            {/* Avatar + Name + Email */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <img
                        src={avatarUrl}
                        alt={doctor.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
                        onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0D8ABC&color=fff`; }}
                    />
                    <div>
                        <p className="text-sm font-bold text-slate-800">{doctor.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{doctor.email}</p>
                    </div>
                </div>
            </td>

            {/* Specialization */}
            <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-blue-50 text-blue-600">
                    {specialization}
                </span>
            </td>

            {/* Phone */}
            <td className="px-6 py-4">
                <p className="text-xs font-semibold text-slate-500">{phoneNumber}</p>
            </td>

            {/* Status — Admin sees toggle, others see badge */}
            <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                {isAdmin ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onToggle(doctor)}
                            disabled={toggling === doctor.id}
                            className={`relative w-10 h-5 rounded-full transition-all duration-300 disabled:opacity-60 ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${isActive ? 'left-5' : 'left-0.5'}`} />
                        </button>
                        <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                ) : (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${isActive ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {isActive ? 'Active' : 'Inactive'}
                    </div>
                )}
            </td>

            {/* View hint */}
            <td className="px-6 py-4 text-right">
                <span className="text-[10px] font-black text-slate-300 group-hover:text-blue-500 uppercase tracking-widest transition-colors">
                    View →
                </span>
            </td>
        </tr>
    );
}