import api from './api';

const authService = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Login user
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.id) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    // Get Google OAuth URL
    getGoogleAuthUrl: async () => {
        const response = await api.get('/auth/google');
        return response.data.url;
    },

    // Login with Google
    loginWithGoogle: (userData) => {
        if (userData.id) {
            localStorage.setItem('user', JSON.stringify(userData));
        }
        return userData;
    },

    // Verify email
    verifyEmail: async (userId) => {
        const response = await api.post('/auth/verify-email', { userId });
        return response.data;
    },

    // Verify email with token
    verifyEmailToken: async (token) => {
        const response = await api.post('/auth/verify-email', { token });
        return response.data;
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Get user profile
    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    // Update profile
    updateProfile: async (profileData) => {
        const response = await api.put('/auth/profile', profileData);
        return response.data;
    },
};

export default authService;
