// TopHeader.jsx
import { useState, useEffect, useRef } from 'react';
import { Search, Bell, History, Menu } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

export function TopNav({ user, onMenuClick, logout }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between py-4 px-6 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm mb-6 lg:static lg:mt-4 lg:mx-8 lg:rounded-2xl lg:border lg:bg-white lg:shadow-sm lg:backdrop-blur-none">
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

                {/* Profile Section with Dropdown */}
                <div className="relative border-l border-slate-200 pl-4" ref={dropdownRef}>
                    <button 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-3 hover:bg-slate-50 p-1 pr-3 rounded-2xl transition-all active:scale-95"
                    >
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-slate-800">{user?.name || 'Loading...'}</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{user?.specialization || 'Medical Staff'}</p>
                        </div>
                        <img
                            src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-2 ring-slate-50"
                        />
                    </button>

                    <ProfileDropdown 
                        isOpen={dropdownOpen} 
                        user={user} 
                        logout={logout} 
                    />
                </div>
            </div>
        </header>
    );
}