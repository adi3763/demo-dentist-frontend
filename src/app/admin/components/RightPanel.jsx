import { Info, ArrowRight } from 'lucide-react';

export default function RightPanel() {
    return (
        <div className="space-y-6">
            {/* Progress Section */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800">Monthly Progress</h3>
                    <Info size={16} className="text-slate-300" />
                </div>

                {/* Mock Chart Visualization */}
                <div className="flex items-end justify-between h-32 gap-2 mb-6 px-2">
                    {[40, 70, 100, 60, 90, 45].map((height, i) => (
                        <div
                            key={i}
                            className={`w-full rounded-t-lg transition-all ${i === 2 ? 'bg-blue-500 relative' : 'bg-slate-50'}`}
                            style={{ height: `${height}%` }}
                        >
                            {i === 2 && <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded">Current</span>}
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-xs font-medium text-slate-500">New Registrations</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">+18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                            <span className="text-xs font-medium text-slate-500">Completed Visits</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">2.4k</span>
                    </div>
                </div>

                <button className="w-full mt-6 py-3 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                    View Detailed Report <ArrowRight size={14} />
                </button>
            </section>

            {/* Hospital Capacity Section */}
            <section className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
                <div className="relative z-10">
                    <h3 className="font-bold mb-1">Hospital Capacity</h3>
                    <p className="text-[10px] text-slate-400 mb-6">Real-time bed availability across all wards.</p>

                    <div className="flex items-end gap-3 mb-4">
                        <span className="text-3xl font-black">84%</span>
                        <span className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Occupied</span>
                    </div>

                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full w-[84%] shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div>
                    </div>
                </div>

                {/* Abstract Background Icon */}
                <div className="absolute -bottom-4 -right-4 opacity-10">
                    <div className="w-24 h-24 border-[12px] border-white rounded-3xl"></div>
                </div>
            </section>
        </div>
    );
}