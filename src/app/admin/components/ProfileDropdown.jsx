import { User, Settings, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfileDropdown({ isOpen, user, onProfileClick, onSettingsClick, logout }) {
    if (!isOpen) return null;

    const menuItems = [];

    return (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 py-3 z-[100] animate-in fade-in zoom-in duration-200 origin-top-right">
            {/* User Info Header */}
            <div className="px-5 py-4 border-b border-slate-50 mb-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated as</p>
                <p className="text-sm font-bold text-slate-800">{user?.name || 'Dr. Sarah Chen'}</p>
                <p className="text-[10px] font-medium text-slate-500">{user?.email || 'sarah.c@SunsKraft.com'}</p>
            </div>

            {/* Menu Links */}
            <div className="px-2 space-y-1">
                {/* View Profile Button - Opens Drawer */}
                <button
                    onClick={onProfileClick}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-white group-hover:shadow-sm transition-all text-blue-500">
                            <User size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">View Profile</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>

                {/* Account Settings Button - Opens Modal */}
                <button
                    onClick={onSettingsClick}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-white group-hover:shadow-sm transition-all text-slate-500">
                            <Settings size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Account Settings</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>

                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-slate-50 group-hover:bg-white group-hover:shadow-sm transition-all ${item.color}`}>
                                <item.icon size={16} />
                            </div>
                            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{item.label}</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </Link>
                ))}

                <div className="h-px bg-slate-50 my-1 mx-2" />

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-50 group-hover:bg-white group-hover:shadow-sm transition-all text-red-500">
                            <LogOut size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-600 group-hover:text-red-600 transition-colors">Sign Out</span>
                    </div>
                </button>
            </div>
        </div>
    );
}