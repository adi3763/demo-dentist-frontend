'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Components
import Sidebar from './components/Sidebar';
import { TopNav } from './components/TopHeader';
import StatCard from './components/StatCard';
import AppointmentItem from './components/AppointmentView';
import RightPanel from './components/RightPanel';
import { LayoutDashboard, Users, CalendarDays, Activity, Plus } from 'lucide-react';

export default function AdminDashboardScreen() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/admin/login');
  }, [loading, user, router]);

  if (loading || !user) return <div className="flex h-screen items-center justify-center font-medium">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
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
        <TopNav user={user} onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-[1600px] mx-auto">

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              <StatCard label="Total Patients" value="12,482" trend="+12%" icon={Users} color="text-blue-600" />
              <StatCard label="Today's Appts" value="42" badge="Today" icon={CalendarDays} color="text-indigo-600" />
              <StatCard label="Total Doctors" value="156" badge="Stable" icon={Activity} color="text-emerald-600" />
              <StatCard label="Revenue" value="$54,230" trend="+8%" icon={Activity} color="text-green-600" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Appointments List - Main Column */}
              <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Today's Appointments</h2>
                  <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
                </div>

                {/* Table Header - PC Only */}
                <div className="hidden lg:grid grid-cols-4 pb-4 border-bottom text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <div>Patient</div>
                  <div>Time</div>
                  <div>Doctor</div>
                  <div>Status</div>
                </div>

                <div className="space-y-4">
                  <AppointmentItem name="John Smith" id="P-9832" time="09:30 AM" dr="Dr. Emily Watson" status="Confirmed" />
                  <AppointmentItem name="Maria Alva" id="P-1209" time="10:45 AM" dr="Dr. Robert Fox" status="In Progress" />
                  <AppointmentItem name="Thomas K." id="P-5541" time="11:15 AM" dr="Dr. Sarah Chen" status="Waiting" />
                </div>
              </div>

              {/* Right Side Panel - Progress & Capacity */}
              <div className="space-y-6">
                <RightPanel />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button - Mobile Only */}
        <button className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg z-50">
          <Plus size={28} />
        </button>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
          <NavItem icon={LayoutDashboard} label="Home" active />
          <NavItem icon={Users} label="Doctors" />
          <NavItem icon={CalendarDays} label="Appts" />
          <NavItem icon={Activity} label="Settings" />
        </nav>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-slate-400'}`}>
      <Icon size={20} />
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </div>
  );
}