const BASE_URL = 'https://demo-dentist-main-adaeep.free.laravel.cloud/api';
const API_HOST = 'https://demo-dentist-main-adaeep.free.laravel.cloud';

export const getStorageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/storage')) return `${API_HOST}${path}`;
    return `${API_HOST}/storage/${path}`;
};

const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
};

const authenticatedFetch = async (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };
    
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    return fetch(`${BASE_URL}${url}`, {
        ...options,
        headers,
    });
};

const apiService = {
    // Auth APIs
    login: async (email, password) => {
        return fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
    },

    getMe: async (token) => {
        return fetch(`${BASE_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
    },

    // Forgot Password Flow
    forgotPassword: async (email) => {
        return fetch(`${BASE_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
    },

    verifyOtp: async (email, otp) => {
        return fetch(`${BASE_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
    },

    resetPassword: async (email, otp, password, password_confirmation) => {
        return fetch(`${BASE_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, password, password_confirmation }),
        });
    },

    // --- ADMIN APIs ---
    
    getAdminDashboard: () => authenticatedFetch('/admin/dashboard'),

    // Users (Doctors) Management
    getAdminUsers: (filter = '') => authenticatedFetch(`/admin/users${filter ? `?filter=${filter}` : ''}`),
    
    createAdminUser: (userData) => authenticatedFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),

    updateAdminUser: (id, userData) => authenticatedFetch(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(userData)
    }),

    toggleAdminUser: (id) => authenticatedFetch(`/admin/users/${id}/toggle`, {
        method: 'PATCH'
    }),

    deleteAdminUser: (id) => authenticatedFetch(`/admin/users/${id}`, {
        method: 'DELETE'
    }),

    restoreAdminUser: (id) => authenticatedFetch(`/admin/users/${id}/restore`, {
        method: 'PATCH'
    }),

    resetAdminUserPassword: (id) => authenticatedFetch(`/admin/users/${id}/reset-password`, {
        method: 'PATCH'
    }),

    // Doctor Profile (Admin side)
    getAdminUserProfile: (id) => authenticatedFetch(`/admin/users/${id}/profile`),
    
    updateAdminUserProfile: (id, profileData) => authenticatedFetch(`/admin/users/${id}/profile`, {
        method: 'PATCH',
        body: JSON.stringify(profileData)
    }),

    // Services Management (Admin)
    getAdminServices: () => authenticatedFetch('/admin/services'),
    
    getAdminServiceById: (id) => authenticatedFetch(`/admin/services/${id}`),
    
    createAdminService: (serviceData) => authenticatedFetch('/admin/services', {
        method: 'POST',
        body: JSON.stringify(serviceData)
    }),

    updateAdminService: (id, serviceData) => authenticatedFetch(`/admin/services/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(serviceData)
    }),

    toggleAdminService: (id) => authenticatedFetch(`/admin/services/${id}/toggle`, {
        method: 'PATCH'
    }),

    deleteAdminService: (id) => authenticatedFetch(`/admin/services/${id}`, {
        method: 'DELETE'
    }),

    // Appointments Management (Admin)
    getAdminAppointments: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.date) params.append('date', filters.date);
        if (filters.status) params.append('status', filters.status);
        if (filters.doctor_id) params.append('doctor_id', filters.doctor_id);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        return authenticatedFetch(`/admin/appointments?${params.toString()}`);
    },

    getAdminAppointmentById: (id) => authenticatedFetch(`/admin/appointments/${id}`),
    
    updateAdminAppointmentStatus: (id, status) => authenticatedFetch(`/admin/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    }),

    deleteAdminAppointment: (id) => authenticatedFetch(`/admin/appointments/${id}`, {
        method: 'DELETE'
    }),

    // Contact Submissions (Admin)
    getAdminContacts: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        return authenticatedFetch(`/admin/contacts?${params.toString()}`);
    },

    getAdminContactById: (id) => authenticatedFetch(`/admin/contacts/${id}`),
    
    markAdminContactRead: (id) => authenticatedFetch(`/admin/contacts/${id}/read`, {
        method: 'PATCH'
    }),

    markAdminContactReplied: (id) => authenticatedFetch(`/admin/contacts/${id}/replied`, {
        method: 'PATCH'
    }),

    deleteAdminContact: (id) => authenticatedFetch(`/admin/contacts/${id}`, {
        method: 'DELETE'
    }),


    // --- DOCTOR APIs ---
    
    getDoctorDashboard: async () => {
        return authenticatedFetch('/doctor/dashboard');
    },

    getDoctorProfile: () => authenticatedFetch('/doctor/profile'),

    updateDoctorProfile: (profileData) => authenticatedFetch('/doctor/profile', {
        method: 'PATCH',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify(profileData)
        
    }),

    uploadDoctorPhoto: (formData) => authenticatedFetch('/doctor/profile/photo', {
        method: 'POST',
        body: formData
    }),

    changePassword: (passwordData) => authenticatedFetch('/doctor/profile/change-password', {
        method: 'PATCH',
        body: JSON.stringify(passwordData)
    }),

    getDoctorSchedule: () => authenticatedFetch('/doctor/schedule'),

    saveDefaultSchedule: () => authenticatedFetch('/doctor/schedule/default', {
        method: 'POST'
    }),

    addBlockedDate: (blockedData) => authenticatedFetch('/doctor/blocked-dates', {
        method: 'POST',
        body: JSON.stringify(blockedData)
    }),

    deleteBlockedDate: (id) => authenticatedFetch(`/doctor/blocked-dates/${id}`, {
        method: 'DELETE'
    }),

    toggleScheduleSlot: (id) => authenticatedFetch(`/doctor/schedule/${id}/toggle`, {
        method: 'PATCH'
    }),

    deleteScheduleSlot: (id) => authenticatedFetch(`/doctor/schedule/${id}`, {
        method: 'DELETE'
    }),

    updateScheduleSlot: (id, scheduleData) => authenticatedFetch(`/doctor/schedule/${id}`, {
        method: 'POST', // Backend logic for method override often prefers POST
        body: JSON.stringify({ ...scheduleData, '_method': 'PATCH' })
    }),

    getDoctorAppointments: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.date) params.append('date', filters.date);
        if (filters.status) params.append('status', filters.status);
        return authenticatedFetch(`/doctor/appointments?${params.toString()}`);
    },

    approveAppointment: (id) => authenticatedFetch(`/doctor/appointments/${id}/approve`, {
        method: 'PATCH'
    }),

    rejectAppointment: (id, reason) => authenticatedFetch(`/doctor/appointments/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason })
    }),

    rescheduleAppointment: (id, rescheduleData) => authenticatedFetch(`/doctor/appointments/${id}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify(rescheduleData)
    }),

    completeAppointment: (id) => authenticatedFetch(`/doctor/appointments/${id}/complete`, {
        method: 'PATCH'
    }),

    // Doctor View (View other doctors)
    getDoctorViewDoctors: () => authenticatedFetch('/doctor/doctors'),
    
    getDoctorViewDoctorById: (id) => authenticatedFetch(`/doctor/doctors/${id}`),


    // --- PUBLIC APIs ---
    
    getPublicDoctors: () => fetch(`${BASE_URL}/doctors`, { headers: { 'Accept': 'application/json' } }),
    
    getDoctorSlots: (doctorId, date) => fetch(`${BASE_URL}/slots?doctor_id=${doctorId}&date=${date}`, { headers: { 'Accept': 'application/json' } }),
    
    getPublicServices: () => fetch(`${BASE_URL}/services`, { headers: { 'Accept': 'application/json' } }),
    
    bookAppointment: (data) => fetch(`${BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
    }),

    submitContactForm: (data) => fetch(`${BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
    }),

    // Legacy/Mixed use compatibility
    getDoctors: async (filter = '', isAdmin = true) => {
        const base = isAdmin ? '/admin/users' : '/doctors';
        return authenticatedFetch(`${base}${filter ? `?filter=${filter}` : ''}`);
    },

    getDoctorById: async (id, isAdmin = true) => {
        const base = isAdmin ? `/admin/users/${id}` : `/doctor/doctors/${id}`;
        return authenticatedFetch(base);
    },

    getServices: () => authenticatedFetch('/services'),
};

export default apiService;
