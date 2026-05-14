'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RefreshCw, Search } from 'lucide-react';
import ServiceRow from '../components/ServiceRow';
import ServiceCardMobile from '../components/ServiceCardMobile';
import apiService from '@/services/api';

export default function ServicesManagement() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await apiService.getServices();
            const data = await res.json();
            if (res.ok) {
                // handle different response shapes gracefully
                setServices(Array.isArray(data) ? data : data.services || data.data || []);
            } else {
                setError(data.message || 'Failed to load services.');
            }
        } catch {
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    const filtered = services.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };

    return (
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto pb-32 lg:pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 lg:mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Services Management</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        {loading ? 'Loading...' : `${services.length} services available`}
                    </p>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                    <button onClick={fetchServices} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-800 shadow-sm active:scale-95 transition-all">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {/* Placeholder for Add Service button in future */}
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    value={search}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Search services by name or description..."
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
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
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Name</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginated.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-16 text-sm font-bold text-slate-400">No services found</td></tr>
                            ) : paginated.map((service) => (
                                <ServiceRow key={service.id} service={service} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mobile Cards */}
            {!loading && (
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {paginated.length === 0
                        ? <p className="text-center py-12 text-sm font-bold text-slate-400 col-span-full">No services found</p>
                        : paginated.map((service) => (
                            <ServiceCardMobile key={service.id} service={service} />
                        ))
                    }
                </div>
            )}

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
                        Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} services
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
                                                item === safePage ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100 text-slate-600'
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
        </div>
    );
}
