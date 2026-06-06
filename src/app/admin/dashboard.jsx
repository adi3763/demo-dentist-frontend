'use client';
import { useState, useEffect } from 'react';
import StatCard from './components/StatCard';
import AppointmentItem from './components/AppointmentView';
import RightPanel from './components/RightPanel';
import { Users, CalendarDays, Activity } from 'lucide-react';
import apiService from '../../services/api';

export default function AdminDashboardScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiService.getAdminDashboard();
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard data...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Error loading dashboard data.</div>;
  }
  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard label="Total Patients" value={data.stats?.contacts?.total || "0"} trend="+12%" icon={Users} color="text-blue-600" />
        <StatCard label="Today's Appts" value={data.stats?.appointments?.today || "0"} badge="Today" icon={CalendarDays} color="text-indigo-600" />
        <StatCard label="Total Doctors" value={data.stats?.doctors?.total || "0"} badge="Stable" icon={Activity} color="text-emerald-600" />
        <StatCard label="Pending Appts" value={data.stats?.appointments?.pending || "0"} badge="Action Needed" icon={Activity} color="text-orange-600" />
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
            {data.today_appointments && data.today_appointments.length > 0 ? (
                data.today_appointments.map(appt => (
                    <AppointmentItem 
                        key={appt.id}
                        name={appt.patient_name} 
                        id={`P-${appt.id}`} 
                        time={appt.start_time} 
                        dr={appt.doctor || 'Unassigned'} 
                        status={appt.status.charAt(0).toUpperCase() + appt.status.slice(1)} 
                    />
                ))
            ) : (
                <div className="text-center text-slate-500 py-6">No appointments scheduled for today.</div>
            )}
          </div>
        </div>

        {/* Right Side Panel - Progress & Capacity */}
        <div className="space-y-6">
          <RightPanel activities={data.recent_activities || []} />
        </div>
      </div>
    </>
  );
}