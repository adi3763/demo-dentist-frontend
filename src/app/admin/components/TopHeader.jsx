// TopHeader.jsx
import { Search, Bell, History, Menu } from 'lucide-react';

export function TopNav({ user, onMenuClick }) {
    return (
        <header className="flex items-center justify-between mt-4 mb-6 mx-4 lg:mx-8 px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
            {/* Mobile Menu Icon */}
            <button onClick={onMenuClick} className="lg:hidden flex items-center gap-3 hover:bg-slate-100 p-2 rounded-lg transition-colors">
                <Menu className="text-slate-600" />
            </button>


            {/* Search - Hidden on Small Mobile */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-xl px-4 py-2.5 w-full max-w-md gap-3 border border-slate-200">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Search patient records..." className="bg-transparent outline-none text-sm w-full" />
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <button className="hidden md:block p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                    <History size={20} />
                </button>
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-slate-800">Dr. Sarah Chen</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase">Chief Administrator</p>
                    </div>
                    <img src="https://ui-avatars.com/api/?name=Sarah+Chen&background=0D8ABC&color=fff" alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                </div>
            </div>
        </header>
    );
}

// BottomNav.jsx (Mobile Only)
export function BottomNav() {
    const items = [
        { icon: LayoutDashboard, label: 'DASHBOARD', active: true },
        { icon: BriefcaseMedical, label: 'DOCTORS' },
        { icon: Users, label: 'PATIENTS' },
        { icon: CalendarCheck2, label: 'APPOINTMENTS' },
        { icon: Settings, label: 'SETTINGS' },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-3 flex justify-around items-center z-50">
            {items.map((item) => (
                <button key={item.label} className={`flex flex-col items-center gap-1 ${item.active ? 'text-blue-600' : 'text-slate-400'}`}>
                    <item.icon size={20} />
                    <span className="text-[9px] font-bold tracking-tighter">{item.label}</span>
                </button>
            ))}
        </div>
    );
}