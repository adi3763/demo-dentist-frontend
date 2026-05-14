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
        const url = isAdmin ? `${BASE_URL}/admin/users/${id}` : `${BASE_URL}/doctors/${id}`;
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
};

export default apiService;
