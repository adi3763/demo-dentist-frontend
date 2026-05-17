'use client';
import { useState, useEffect } from 'react';
import { Clock, Calendar, Plus, Trash2, Edit2, Lock, Unlock, AlertCircle, CheckCircle2, ChevronDown, Save, X } from 'lucide-react';
import apiService from '@/services/api';

export default function DoctorSchedulePage() {
    const [schedules, setSchedules] = useState([]);
    const [blockedDates, setBlockedDates] = useState([]);
    const [isUsingDefault, setIsUsingDefault] = useState(true);
    const [defaultInfo, setDefaultInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mutationLoading, setMutationLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Blocked Date State
    const [newBlocked, setNewBlocked] = useState({ blocked_date: '', reason: '' });
    
    // Slot Edit State
    const [editingSlotId, setEditingSlotId] = useState(null);
    const [editSlotForm, setEditSlotForm] = useState({ day_of_week: 0, start_time: '', end_time: '' });

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const response = await apiService.getDoctorSchedule();
            const data = await response.json();
            if (response.ok) {
                setSchedules(data.schedule || []);
                setBlockedDates(data.blocked_dates || []);
                setIsUsingDefault(data.using_default_schedule);
                setDefaultInfo(data.default_schedule);
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleCustomize = async () => {
        setMutationLoading(true);
        try {
            const res = await apiService.saveDefaultSchedule();
            if (res.ok) fetchSchedule();
        } finally { setMutationLoading(false); }
    };

    const handleToggleSlot = async (id) => {
        try {
            const res = await apiService.toggleScheduleSlot(id);
            if (res.ok) fetchSchedule();
        } catch (error) { console.error(error); }
    };

    const handleDeleteSlot = async (id) => {
        if (!confirm('Delete this slot?')) return;
        try {
            const res = await apiService.deleteScheduleSlot(id);
            if (res.ok) fetchSchedule();
        } catch (error) { console.error(error); }
    };

    const handleAddBlockedDate = async (e) => {
        e.preventDefault();
        setMutationLoading(true);
        try {
            const res = await apiService.addBlockedDate(newBlocked);
            if (res.ok) {
                setNewBlocked({ blocked_date: '', reason: '' });
                fetchSchedule();
                setStatus({ type: 'success', message: 'Leave date added' });
            }
        } finally { setMutationLoading(false); }
    };

    const handleDeleteBlockedDate = async (id) => {
        try {
            const res = await apiService.deleteBlockedDate(id);
            if (res.ok) fetchSchedule();
        } catch (error) { console.error(error); }
    };

    const handleUpdateSlot = async (e) => {
        e.preventDefault();
        setMutationLoading(true);
        try {
            const response = await apiService.updateScheduleSlot(editingSlotId, editSlotForm);
            if (response.ok) {
                setEditingSlotId(null);
                fetchSchedule();
                setStatus({ type: 'success', message: 'Slot updated' });
            }
        } finally { setMutationLoading(false); }
    };

    const getDayName = (dayNum) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayNum];
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        const hh = parseInt(h);
        return `${hh % 12 || 12}:${m} ${hh >= 12 ? 'PM' : 'AM'}`;
    };

    if (loading) return <div className="p-10 animate-pulse space-y-8"><div className="h-10 w-48 bg-slate-200 rounded-xl" /><div className="h-96 bg-white rounded-[40px]" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinic Schedule</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage your availability and leaves</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Weekly Schedule */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Clock size={20} />
                                </div>
                                <h2 className="text-lg font-black text-slate-800 tracking-tight">Weekly Availability</h2>
                            </div>
                            {isUsingDefault && (
                                <button 
                                    onClick={handleCustomize}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                >
                                    Customize My Schedule
                                </button>
                            )}
                        </div>

                        {isUsingDefault ? (
                            <div className="p-10 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[32px] text-center">
                                <Clock size={40} className="mx-auto mb-4 text-slate-300" />
                                <h3 className="text-base font-black text-slate-700">Using Default Clinic Hours</h3>
                                <p className="text-xs font-medium text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                                    {defaultInfo?.days || 'Monday to Saturday'} • {defaultInfo?.hours || '09:00 AM - 05:00 PM'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {[1, 2, 3, 4, 5, 6, 0].map(dayNum => {
                                    const daySlots = schedules.filter(s => s.day_of_week === dayNum);
                                    if (daySlots.length === 0) return null;
                                    return (
                                        <div key={dayNum} className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{getDayName(dayNum)}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {daySlots.map(slot => (
                                                    <div key={slot.id} className="group p-5 bg-white border border-slate-100 rounded-[28px] shadow-sm hover:border-blue-200 transition-all">
                                                        {editingSlotId === slot.id ? (
                                                            <form onSubmit={handleUpdateSlot} className="space-y-4">
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <TimeInput label="Start" value={editSlotForm.start_time} onChange={v => setEditSlotForm({...editSlotForm, start_time: v})} />
                                                                    <TimeInput label="End" value={editSlotForm.end_time} onChange={v => setEditSlotForm({...editSlotForm, end_time: v})} />
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700">Save</button>
                                                                    <button type="button" onClick={() => setEditingSlotId(null)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-2.5 h-2.5 rounded-full ${slot.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} />
                                                                    <span className="text-sm font-bold text-slate-700">{formatTime(slot.start_time)} — {formatTime(slot.end_time)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => { setEditingSlotId(slot.id); setEditSlotForm({ day_of_week: slot.day_of_week, start_time: slot.start_time.substring(0, 5), end_time: slot.end_time.substring(0, 5) }); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"><Edit2 size={14} /></button>
                                                                    <button onClick={() => handleToggleSlot(slot.id)} className={`p-2 rounded-xl transition-colors ${slot.is_active ? 'text-slate-400' : 'text-emerald-500 hover:bg-emerald-50'}`}>{slot.is_active ? <Lock size={14} /> : <Unlock size={14} />}</button>
                                                                    <button onClick={() => handleDeleteSlot(slot.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={14} /></button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Blocked Dates */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                                <Calendar size={20} />
                            </div>
                            <h2 className="text-lg font-black text-slate-800 tracking-tight">Leaves</h2>
                        </div>

                        <form onSubmit={handleAddBlockedDate} className="space-y-4 p-5 bg-slate-50/50 rounded-[32px] border border-slate-100">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Date</label>
                                <input 
                                    type="date" 
                                    required
                                    value={newBlocked.blocked_date}
                                    onChange={e => setNewBlocked({...newBlocked, blocked_date: e.target.value})}
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                                <input 
                                    type="text"
                                    placeholder="Conference, Personal..."
                                    value={newBlocked.reason}
                                    onChange={e => setNewBlocked({...newBlocked, reason: e.target.value})}
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={mutationLoading}
                                className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                            >
                                Add Blocked Date
                            </button>
                        </form>

                        <div className="space-y-3">
                            {blockedDates.length > 0 ? (
                                blockedDates.map(bd => (
                                    <div key={bd.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-red-100 transition-all group">
                                        <div>
                                            <p className="text-sm font-black text-slate-700">{new Date(bd.blocked_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{bd.reason || 'No reason'}</p>
                                        </div>
                                        <button onClick={() => handleDeleteBlockedDate(bd.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-4">No leaves scheduled</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function TimeInput({ label, value, onChange }) {
    return (
        <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input 
                type="time"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            />
        </div>
    );
}
