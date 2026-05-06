export default function StatCard({ label, value, trend, badge, icon: Icon, color }) {
    return (
        <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl bg-slate-50 ${color}`}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                        {trend}
                    </span>
                )}
                {badge && (
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                        {badge}
                    </span>
                )}
            </div>
            <div>
                <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
            </div>
        </div>
    );
}