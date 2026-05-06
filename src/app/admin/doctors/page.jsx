'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Download, RefreshCw, Search } from 'lucide-react';
import DoctorRow from '../components/DoctorRow';
import DoctorCardMobile from '../components/DoctorCardMobile';
import AddDoctorModal from '../components/AddDoctorModal';
import DoctorDetailModal from '../components/DoctorDetailModal';
import apiService from '@/services/api';

export default function DoctorManagement() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'clinic administrator';

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [toggling, setToggling] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState(''); // '' for All, 'active' for Active
    const PAGE_SIZE = 10;

    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await apiService.getDoctors(statusFilter);
            const data = await res.json();
            if (res.ok) {
                // handle both { data: [...] } and direct array responses
                setDoctors(Array.isArray(data) ? data : data.data || data.users || []);
            } else {
                setError(data.message || 'Failed to load doctors.');
            }
        } catch {
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

    const handleToggle = async (doctor) => {
        setToggling(doctor.id);
        try {
            const res = await apiService.toggleDoctorStatus(doctor.id);
            if (res.ok) {
                // Optimistically update the list
                setDoctors(prev => prev.map(d =>
                    d.id === doctor.id
                        ? { ...d, is_active: !d.is_active, status: (!d.is_active || d.status === 'Inactive') ? 'Active' : 'Inactive' }
                        : d
                ));
                // Also update the selected doctor in the modal if open
                setSelectedDoctor(prev => prev && prev.id === doctor.id
                    ? { ...prev, is_active: !prev.is_active, status: (!prev.is_active || prev.status === 'Inactive') ? 'Active' : 'Inactive' }
                    : prev
                );
            }
        } catch { /* silent fail */ }
        finally { setToggling(null); }
    };

    const filtered = doctors.filter(d =>
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.profile?.specialization?.toLowerCase().includes(search.toLowerCase()) ||
        d.email?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };

    const exportToCSV = () => {
        const headers = [
            'Name', 'Email', 'Phone', 'Specialization', 'Qualification',
            'Experience (Years)', 'Consultation Fee', 'Address', 'City',
            'State', 'Pincode', 'Languages', 'Available Days', 'Status'
        ];

        const rows = filtered.map(d => {
            const p = d.profile || {};
            const isActive = d.is_active ?? (d.status === 'Active');
            return [
                d.name || '',
                d.email || '',
                d.phone || '',
                p.specialization || '',
                p.qualification || '',
                p.experience_years || '',
                p.consultation_fee || '',
                p.address || '',
                p.city || '',
                p.state || '',
                p.pincode || '',
                (p.languages || []).join(' | '),
                (p.available_days || []).join(' | '),
                isActive ? 'Active' : 'Inactive',
            ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `doctors_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto pb-32 lg:pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 lg:mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Doctor Management</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        {loading ? 'Loading...' : `${doctors.length} doctors on the panel`}
                    </p>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                    <button onClick={fetchDoctors} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-800 shadow-sm active:scale-95 transition-all">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        <button 
                            onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === '' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === 'active' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Active
                        </button>
                    </div>

                    <button
                        onClick={exportToCSV}
                        disabled={filtered.length === 0}
                        className="hidden sm:flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 shadow-sm active:scale-95 transition-transform disabled:opacity-40"
                    >
                        <Download size={18} className="text-slate-400" /> Export CSV
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setAddModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-[0_8px_20px_rgba(37,99,235,0.3)] active:scale-95 transition-transform"
                        >
                            <Plus size={18} /> Add Doctor
                        </button>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    value={search}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Search by name, specialization or email..."
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm font-medium text-red-600">{error}</div>
            )}

            {/* Loading Skeletons */}
            {loading && (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-8 py-4 border-b border-slate-50 last:border-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-slate-100 rounded-full animate-pulse w-1/3" />
                                <div className="h-2.5 bg-slate-100 rounded-full animate-pulse w-1/4" />
                            </div>
                            <div className="h-6 w-20 bg-slate-100 rounded-lg animate-pulse" />
                        </div>
                    ))}
                </div>
            )}

            {/* Desktop Table */}
            {!loading && (
                <div className="hidden lg:block bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Doctor</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Specialization</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phone</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginated.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-16 text-sm font-bold text-slate-400">No doctors found</td></tr>
                            ) : paginated.map((doc) => (
                                <DoctorRow
                                    key={doc.id}
                                    doctor={doc}
                                    isAdmin={isAdmin}
                                    onClick={() => setSelectedDoctor(doc)}
                                    onToggle={handleToggle}
                                    toggling={toggling}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mobile Cards */}
            {!loading && (
                <div className="lg:hidden space-y-4">
                    {paginated.length === 0
                        ? <p className="text-center py-12 text-sm font-bold text-slate-400">No doctors found</p>
                        : paginated.map((doc) => (
                            <div key={doc.id} onClick={() => setSelectedDoctor(doc)}>
                                <DoctorCardMobile doctor={doc} />
                            </div>
                        ))
                    }
                </div>
            )}

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
                        Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} doctors
                    </p>
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 shadow-sm disabled:opacity-40 transition-all"
                        >
                            ← Prev
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                                .reduce((acc, p, idx, arr) => {
                                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((item, idx) =>
                                    item === '...' ? (
                                        <span key={`dot-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">…</span>
                                    ) : (
                                        <button
                                            key={item}
                                            onClick={() => setCurrentPage(item)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                                                item === safePage ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    )
                                )
                            }
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 shadow-sm disabled:opacity-40 transition-all"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* Add Doctor Modal */}
            {isAdmin && (
                <AddDoctorModal
                    isOpen={addModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    onSuccess={() => { setAddModalOpen(false); fetchDoctors(); }}
                />
            )}

            {/* Doctor Detail Modal */}
            <DoctorDetailModal
                doctor={selectedDoctor}
                isOpen={!!selectedDoctor}
                onClose={() => setSelectedDoctor(null)}
                isAdmin={isAdmin}
                onToggleStatus={handleToggle}
                toggling={toggling}
            />
        </div>
    );
}