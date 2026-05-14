'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import { TopNav } from './components/TopHeader';
import { LayoutDashboard, Users, CalendarDays, Activity, LogOut, Stethoscope } from 'lucide-react';

function NavItem({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-slate-400'} hover:text-blue-500 transition-colors`}
    >
      <Icon size={20} />
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const publicRoutes = ['/admin/login', '/admin/forgot-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublicRoute) {
      router.replace('/admin/login');
    }
  }, [loading, user, router, pathname]);

  // Don't apply layout to public pages (login, forgot-password)
  if (isPublicRoute) {
    return children;
  }

  // Show loading only if we are loading AND don't have a cached user yet
  if (loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500">Initializing Admin...</p>
        </div>
      </div>
    );
  }

  // Final safety check: if not loading and no user, the useEffect will handle the redirect, 
  // but we shouldn't render the layout if we definitely don't have a user.
  if (!user && !isPublicRoute) {
    return null; // The redirect will kick in
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar logout={logout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav user={user} onMenuClick={() => setSidebarOpen(true)} logout={logout} />

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 flex justify-around items-center z-50">
          <NavItem icon={LayoutDashboard} label="Home" active={pathname === '/admin'} onClick={() => router.push('/admin')} />
          <NavItem icon={Users} label="Doctors" active={pathname === '/admin/doctors'} onClick={() => router.push('/admin/doctors')} />
          <NavItem icon={Stethoscope} label="Services" active={pathname === '/admin/services'} onClick={() => router.push('/admin/services')} />
          <NavItem icon={CalendarDays} label="Appts" active={pathname === '/admin/appointments'} onClick={() => router.push('/admin/appointments')} />
          <NavItem icon={Activity} label="Settings" active={pathname === '/admin/settings'} onClick={() => router.push('/admin/settings')} />
          <NavItem icon={LogOut} label="Logout" onClick={logout} />
        </nav>
      </main>
    </div>
  );
}
