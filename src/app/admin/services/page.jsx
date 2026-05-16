'use client';
import { useState, useEffect } from 'react';
import { 
    Stethoscope, 
    Plus, 
    Edit, 
    Trash2, 
    CheckCircle2, 
    AlertCircle, 
    X, 
    DollarSign, 
    Clock, 
    ToggleLeft, 
    ToggleRight,
    Search
} from 'lucide-react';
import apiService from '@/services/api';

import { useAuth } from '@/context/AuthContext';

export default function ServicesManagementPage() {
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mutationLoading, setMutationLoading] = useState(null);
    const [search, setSearch] = useState('');

    // Modal state
    const [modal, setModal] = useState({ isOpen: false, type: 'create', service: null });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration_minutes: 30,
        is_active: true
    });

    useEffect(() => {
        fetchServices();
    }, [isAdmin]);

    const fetchContacts = async () => { /* ... dummy to keep track ... */ };

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = isAdmin 
                ? await apiService.getAdminServices()
                : await apiService.getPublicServices();
            
            const data = await res.json();
            if (res.ok) {
                setServices(data.services || []);
            } else {
                setError(data.message || 'Failed to load services');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setFormData({ name: '', description: '', price: '', duration_minutes: 30, is_active: true });
        setModal({ isOpen: true, type: 'create', service: null });
    };

    const handleOpenEdit = (service) => {
        setFormData({
            name: service.name,
            description: service.description || '',
            price: service.price || '',
            duration_minutes: service.duration_minutes || 30,
            is_active: service.is_active
        });
        setModal({ isOpen: true, type: 'edit', service });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMutationLoading(modal.type);
        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                duration_minutes: parseInt(formData.duration_minutes) || 30
            };
            
            const res = modal.type === 'create' 
                ? await apiService.createAdminService(data)
                : await apiService.updateAdminService(modal.service.id, data);
            
            if (res.ok) {
                setModal({ isOpen: false, type: 'create', service: null });
                fetchServices();
            } else {
                const result = await res.json();
                alert(result.message || 'Action failed');
            }
        } finally {
            setMutationLoading(null);
        }
    };

    const handleToggle = async (id) => {
        setMutationLoading(id);
        try {
            const res = await apiService.toggleAdminService(id);
            if (res.ok) fetchServices();
        } finally {
            setMutationLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        setMutationLoading(id);
        try {
            const res = await apiService.deleteAdminService(id);
            if (res.ok) fetchServices();
        } finally {
            setMutationLoading(null);
        }
    };

    const filteredServices = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Services</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{isAdmin ? 'Manage dental treatments and pricing' : 'Available dental treatments'}</p>
                </div>
                {isAdmin && (
                    <button 
                        onClick={handleOpenCreate}
                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                    >
                        <Plus size={18} strokeWidth={3} />
                        New Service
                    </button>
                )}
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="relative flex-1">
                    <input 
                        type="text" 
                        placeholder="Search services..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-12 text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                </div>
            </div>

            {/* Services Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 bg-white rounded-[32px] animate-pulse border border-slate-100" />
                    ))}
                </div>
            ) : error ? (
                <div className="p-8 bg-red-50 text-red-600 rounded-[32px] border border-red-100 flex items-center gap-3">
                    <AlertCircle size={24} />
                    <p className="font-bold">{error}</p>
                </div>
            ) : filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                        <div key={service.id} className={`group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between ${!service.is_active && 'opacity-60 grayscale'}`}>
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold shadow-sm">
                                        <Stethoscope size={24} />
                                    </div>
                                    {isAdmin && (
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${service.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                            {service.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{service.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">{service.description || 'No description provided.'}</p>
                                </div>
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                                        <DollarSign size={14} />
                                        <span className="text-sm">{service.price || '0.00'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                                        <Clock size={14} />
                                        <span className="text-xs">{service.duration_minutes} min</span>
                                    </div>
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="flex items-center justify-end gap-2 mt-8 pt-6 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleToggle(service.id)}
                                        className={`p-2 rounded-xl transition-all ${service.is_active ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                                        title={service.is_active ? 'Disable' : 'Enable'}
                                    >
                                        {service.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                    </button>
                                    <button 
                                        onClick={() => handleOpenEdit(service)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                        title="Edit Service"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(service.id)}
                                        className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                                        title="Delete Service"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                    <Stethoscope size={48} className="mx-auto mb-4 opacity-10 text-slate-300" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No services found</p>
                </div>
            )}

            {/* Create/Edit Modal */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModal({ ...modal, isOpen: false })} />
                    <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{modal.type === 'create' ? 'Add Service' : 'Edit Service'}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Service Details & Pricing</p>
                            </div>
                            <button onClick={() => setModal({ ...modal, isOpen: false })} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Name</label>
                                <input 
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea 
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Min)</label>
                                    <input 
                                        type="number"
                                        value={formData.duration_minutes}
                                        onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${formData.is_active ? 'bg-blue-600' : 'bg-slate-200'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${formData.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Service Active</span>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setModal({ ...modal, isOpen: false })}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={mutationLoading === modal.type}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                                >
                                    {mutationLoading === modal.type ? 'Saving...' : 'Save Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
