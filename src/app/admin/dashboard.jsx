'use client';
import StatCard from './components/StatCard';
import AppointmentItem from './components/AppointmentView';
import RightPanel from './components/RightPanel';
import { Users, CalendarDays, Activity } from 'lucide-react';

export default function AdminDashboardScreen() {
  return (
    <>
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
          <div className="hidden lg:grid grid-cols-4 pb-4 border-b text-xs font-bold text-slate-400 uppercase tracking-wider">
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
    </>
  );
}