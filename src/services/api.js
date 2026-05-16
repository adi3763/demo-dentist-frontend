const BASE_URL = 'https://demo-dentist-main-adaeep.free.laravel.cloud/api';

const apiService = {
    // Auth APIs
    login: async (email, password) => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return response;
    },

    getMe: async (token) => {
        const response = await fetch(`${BASE_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        return response;
    },

    // Forgot Password Flow
    forgotPassword: async (email) => {
        const response = await fetch(`${BASE_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return response;
    },

    verifyOtp: async (email, otp) => {
        const response = await fetch(`${BASE_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        return response;
    },

    resetPassword: async (email, otp, password, password_confirmation) => {
        const response = await fetch(`${BASE_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, password, password_confirmation }),
        });
        return response;
    },

    // Doctor APIs
    createDoctor: async (doctorData) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify(doctorData),
        });
        return response;
    },

    getDoctors: async (filter = '', isAdmin = true) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        // Admins use /admin/users (full control); doctors use /doctors (view-only, no admin guard)
        const base = isAdmin ? `${BASE_URL}/admin/users` : `${BASE_URL}/doctors`;
        const url = filter ? `${base}?filter=${filter}` : base;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        return response;
    },

    getDoctorById: async (id, isAdmin = true) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const url = isAdmin ? `${BASE_URL}/admin/users/${id}` : `${BASE_URL}/doctor/doctors/${id}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        return response;
    },

    toggleDoctorStatus: async (id) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/admin/users/${id}/toggle`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        return response;
    },

    // Services APIs
    getServices: async () => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/services`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        return response;
    },

    // Public APIs for Booking
    getPublicDoctors: async () => {
        const response = await fetch(`${BASE_URL}/doctors`, {
            headers: { 'Accept': 'application/json' },
        });
        return response;
    },

    getDoctorSlots: async (doctorId, date) => {
        const response = await fetch(`${BASE_URL}/slots?doctor_id=${doctorId}&date=${date}`, {
            headers: { 'Accept': 'application/json' },
        });
        return response;
    },

    getPublicServices: async () => {
        const response = await fetch(`${BASE_URL}/services`, {
            headers: { 'Accept': 'application/json' },
        });
        return response;
    },

    bookAppointment: async (data) => {
        const response = await fetch(`${BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response;
    },

    submitContactForm: async (data) => {
        const response = await fetch(`${BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response;
    },

    // Doctor Profile APIs
    getDoctorProfile: async () => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        return response;
    },

    updateDoctorProfile: async (profileData) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(profileData),
        });
        return response;
    },

    uploadDoctorPhoto: async (formData) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/profile/photo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData,
        });
        return response;
    },

    changePassword: async (passwordData) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/profile/change-password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify(passwordData),
        });
        return response;
    },

    getDoctorSchedule: async () => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/schedule`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        return response;
    },

    saveDefaultSchedule: async () => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/schedule/default`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        return response;
    },

    addBlockedDate: async (blockedData) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/blocked-dates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify(blockedData),
        });
        return response;
    },

    deleteBlockedDate: async (id) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/blocked-dates/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        return response;
    },

    toggleScheduleSlot: async (id) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/schedule/${id}/toggle`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        return response;
    },

    deleteScheduleSlot: async (id) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/schedule/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        return response;
    },

    updateScheduleSlot: async (id, scheduleData) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/schedule/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                ...scheduleData,
                '_method': 'PATCH'
            }),
        });
        return response;
    },

    getDoctorAppointments: async (filters = {}) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const queryParams = new URLSearchParams();
        if (filters.date) queryParams.append('date', filters.date);
        if (filters.status) queryParams.append('status', filters.status);
        
        const url = `${BASE_URL}/doctor/appointments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        return response;
    },

    approveAppointment: async (id) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/appointments/${id}/approve`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        return response;
    },

    rejectAppointment: async (id, reason) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/appointments/${id}/reject`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify({ reason }),
        });
        return response;
    },

    rescheduleAppointment: async (id, rescheduleData) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/appointments/${id}/reschedule`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify(rescheduleData),
        });
        return response;
    },

    completeAppointment: async (id) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const response = await fetch(`${BASE_URL}/doctor/appointments/${id}/complete`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        return response;
    },
};

export default apiService;
