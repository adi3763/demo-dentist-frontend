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

    getDoctors: async (filter = '') => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
        const url = filter ? `${BASE_URL}/admin/users?filter=${filter}` : `${BASE_URL}/admin/users`;
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
};

export default apiService;
