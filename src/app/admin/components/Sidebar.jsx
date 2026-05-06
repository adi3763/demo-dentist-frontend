import { LayoutDashboard, Users, UserCircle, Calendar, Settings, HelpCircle, LogOut, Plus, X } from 'lucide-react';

export default function Sidebar({ logout, isOpen, onClose }) {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', active: true },
        { icon: Users, label: 'Doctors' },
        { icon: UserCircle, label: 'Patients' },
        { icon: Calendar, label: 'Appointments' },
        { icon: Settings, label: 'Settings' },
        { icon: HelpCircle, label: 'Help Center' },
    ];

    return (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-400 flex flex-col p-6 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between mb-10 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                    <h1 className="text-white font-bold tracking-tight">MediCore Admin</h1>
                </div>
                <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <button key={item.label} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto space-y-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Plus size={18} /> New Appointment
                </button>
                <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 hover:text-white transition-colors">
                    <LogOut size={20} /> <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}