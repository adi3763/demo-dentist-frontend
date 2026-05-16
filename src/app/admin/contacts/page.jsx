'use client';
import { useState, useEffect } from 'react';
import { 
    MessageSquare, 
    Search, 
    Filter, 
    Mail, 
    Phone, 
    Calendar, 
    Trash2, 
    CheckCircle2, 
    Eye, 
    X,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    User,
    Check
} from 'lucide-react';
import apiService from '@/services/api';

export default function ContactsManagementPage() {
    const [contacts, setContacts] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mutationLoading, setMutationLoading] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        page: 1
    });

    // Detail Modal
    const [detailModal, setDetailModal] = useState({ isOpen: false, contact: null });

    useEffect(() => {
        fetchContacts();
    }, [filters]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await apiService.getAdminContacts(filters);
            const data = await res.json();
            if (res.ok) {
                setContacts(data.data || []);
                setPagination({
                    current_page: data.current_page,
                    last_page: data.last_page,
                    total: data.total
                });
            } else {
                setError(data.message || 'Failed to fetch contacts');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const viewContact = async (id) => {
        try {
            const res = await apiService.getAdminContactById(id);
            const data = await res.json();
            if (res.ok) {
                setDetailModal({ isOpen: true, contact: data.contact || data }); // Backend might return {contact: ...} or direct object
                // Auto mark as read if it was new
                if (data.status === 'new') fetchContacts();
            }
        } catch (err) { console.error(err); }
    };

    const handleMarkReplied = async (id) => {
        setMutationLoading(id);
        try {
            const res = await apiService.markAdminContactReplied(id);
            if (res.ok) {
                fetchContacts();
                if (detailModal.isOpen) setDetailModal({ ...detailModal, isOpen: false });
            }
        } finally {
            setMutationLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Permanently delete this inquiry?')) return;
        setMutationLoading(id);
        try {
            const res = await apiService.deleteAdminContact(id);
            if (res.ok) fetchContacts();
        } finally {
            setMutationLoading(null);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'new': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'read': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'replied': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contacts</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage patient inquiries and website messages</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <input 
                        type="text" 
                        placeholder="Search name, email or phone..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-12 text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                </div>
                
                <div className="flex bg-slate-50 p-1.5 rounded-2xl">
                    {['', 'new', 'read', 'replied'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilters({...filters, status: s, page: 1})}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${filters.status === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {s || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table/List */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquiry From</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Detail</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject/Service</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="h-20 bg-white/50" /></tr>)
                            ) : contacts.length > 0 ? (
                                contacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <p className={`text-sm font-black tracking-tight ${contact.status === 'new' ? 'text-slate-900' : 'text-slate-600'}`}>{contact.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(contact.created_at).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                    <Mail size={12} className="text-slate-300" />
                                                    {contact.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                    <Phone size={12} className="text-slate-300" />
                                                    {contact.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-xs font-bold text-blue-600">{contact.service?.name || 'General Inquiry'}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(contact.status)}`}>
                                                {contact.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => viewContact(contact.id)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="View Message"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleMarkReplied(contact.id)}
                                                    className={`p-2 rounded-xl transition-all ${contact.status === 'replied' ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                                                    title="Mark Replied"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(contact.id)}
                                                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400">
                                        <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                                        <p className="text-sm font-bold uppercase tracking-widest">No inquiries found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                disabled={filters.page === 1}
                                onClick={() => setFilters({...filters, page: filters.page - 1})}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-40"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button 
                                disabled={filters.page === pagination.last_page}
                                onClick={() => setFilters({...filters, page: filters.page + 1})}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-40"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {detailModal.isOpen && detailModal.contact && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setDetailModal({ isOpen: false, contact: null })} />
                    <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 pb-0">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <User size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{detailModal.contact.name}</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Inquiry ID: #{detailModal.contact.id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setDetailModal({ isOpen: false, contact: null })} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Mail size={16} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-700">{detailModal.contact.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Phone size={16} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-700">{detailModal.contact.phone}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Calendar size={16} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-700">{new Date(detailModal.contact.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(detailModal.contact.status)}`}>
                                            {detailModal.contact.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-3xl p-8 mb-10 relative">
                                <MessageSquare size={40} className="absolute top-6 right-8 text-slate-200" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Patient Message</p>
                                <p className="text-base font-medium text-slate-700 leading-relaxed italic">
                                    "{detailModal.contact.message}"
                                </p>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                            <button 
                                onClick={() => handleDelete(detailModal.contact.id)}
                                className="px-6 py-3 text-red-500 text-xs font-bold hover:bg-red-50 rounded-xl transition-all"
                            >
                                Delete Inquiry
                            </button>
                            <button 
                                onClick={() => handleMarkReplied(detailModal.contact.id)}
                                disabled={detailModal.contact.status === 'replied'}
                                className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Check size={18} strokeWidth={3} />
                                {detailModal.contact.status === 'replied' ? 'Replied' : 'Mark as Replied'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
