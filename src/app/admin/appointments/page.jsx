'use client';
import { useState } from 'react';
import { Calendar, ChevronDown, Filter, RefreshCw, Search, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import AppointmentRow from '../components/AppointmentRow';
import AppointmentCardMobile from '../components/AppointmentCardMobile';

const appointmentsData = [
    { id: 'MC-4921', patient: "Alexander Wright", doctor: "Dr. Sarah Jenkins", date: "Oct 14, 2023", time: "09:30 AM", dept: "Cardiology", dotColor: "bg-blue-500" },
    { id: 'MC-8820', patient: "Maria Thompson", doctor: "Dr. Michael Chen", date: "Oct 14, 2023", time: "11:00 AM", dept: "Neurology", dotColor: "bg-emerald-500" },
    { id: 'MC-1102', patient: "James Bennett", doctor: "Dr. Elena Rodriguez", date: "Oct 13, 2023", time: "02:15 PM", dept: "Pediatrics", dotColor: "bg-purple-500" },
    { id: 'MC-7731', patient: "Sarah Lee", doctor: "Dr. Sarah Jenkins", date: "Oct 12, 2023", time: "10:45 AM", dept: "Cardiology", dotColor: "bg-blue-500" },
];

export default function AppointmentManagement() {


    return (
        <div className="p-4 lg:p-8 max-w-[1200px] mx-auto pb-24">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Appointment Management</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Manage and schedule clinical visits for all departments.</p>
            </div>

            {/* Filter Section - Matches image_5cc20c.png */}
            <div className="bg-white rounded-[24px] p-6 mb-8 border border-slate-100 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 items-end">
                    {/* Doctor Filter */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Doctor</label>
                        <div className="relative">
                            <select className="w-full bg-slate-50 border-none rounded-xl py-3 pl-4 pr-10 text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-blue-500/10 outline-none">
                                <option>All Medical Staff</option>
                                <option>Dr. Sarah Jenkins</option>
                                <option>Dr. Michael Chen</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Range</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="date"
                                    onKeyDown={(e) => e.preventDefault()}
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                    className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-2 text-[11px] font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10 outline-none cursor-pointer"
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                            <div className="relative flex-1">
                                <input
                                    type="date"
                                    onKeyDown={(e) => e.preventDefault()}
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                    className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-2 text-[11px] font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10 outline-none cursor-pointer"
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Time Range */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Range</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="time"
                                    onKeyDown={(e) => e.preventDefault()}
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                    className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-2 text-[11px] font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10 outline-none cursor-pointer"
                                />
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                            <div className="relative flex-1">
                                <input
                                    type="time"
                                    onKeyDown={(e) => e.preventDefault()}
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                    className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-2 text-[11px] font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10 outline-none cursor-pointer"
                                />
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Filter Action */}
                    <div className="flex items-end">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.2)] active:scale-95 transition-all text-sm w-full xl:w-auto min-w-[140px]">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient</th>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Doctor</th>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Date & Time</th>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {appointmentsData.map((appt) => (
                            <AppointmentRow key={appt.id} appt={appt} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {appointmentsData.map((appt) => (
                    <AppointmentCardMobile key={appt.id} appt={appt} />
                ))}
            </div>

            {/* Pagination Footer */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
                    Showing 1 to {appointmentsData.length} of 42 entries
                </p>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 shadow-sm disabled:opacity-50 transition-all">
                        <ChevronLeft size={16} />
                        Previous
                    </button>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 text-xs font-bold">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 text-xs font-bold">3</button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 shadow-sm transition-all">
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}