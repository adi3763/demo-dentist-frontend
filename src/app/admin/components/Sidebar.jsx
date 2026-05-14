import { LayoutDashboard, Users, Calendar, Settings, HelpCircle, LogOut, X, Stethoscope } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar({ logout, isOpen, onClose }) {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
        { icon: Users, label: 'Doctors', href: '/admin/doctors' },
        { icon: Stethoscope, label: 'Services', href: '/admin/services' },
        { icon: Calendar, label: 'Appointments', href: '/admin/appointments' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
        { icon: HelpCircle, label: 'Help Center', href: '/admin/help' },
    ];

    return (
        <div className={`fixed inset-y-0 left-0 z-[60] w-64 bg-[#0f172a] text-slate-400 flex flex-col p-6 pb-24 lg:pb-6 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between mb-10 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                    <h1 className="text-white font-bold tracking-tight">SunsKraft Admin</h1>
                </div>
                <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <button
                            key={item.label}
                            onClick={() => {
                                router.push(item.href);
                                if (isOpen) onClose();
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto">
                <button onClick={logout} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors border border-red-500/20">
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </div>
    );
}