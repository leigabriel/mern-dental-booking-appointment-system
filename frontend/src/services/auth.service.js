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
        if (response.data && (response.data.accessToken || response.data.token)) {
            // Store per-tab in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    // Get Google OAuth URL
    getGoogleAuthUrl: async () => {
        const response = await api.get('/auth/google');
        return response.data.url;
    },

    // Login with Google
    loginWithGoogle: async (userData) => {
        // After Google callback, exchange user info for a JWT token bound to this tab
        try {
            const payload = { email: userData.email };
            const response = await api.post('/auth/oauth-login', payload);
            if (response.data && (response.data.accessToken || response.data.token)) {
                sessionStorage.setItem('user', JSON.stringify(response.data));
                return response.data;
            }
            return userData;
        } catch (err) {
            // fallback: store minimal user info in session (no token)
            sessionStorage.setItem('user', JSON.stringify(userData));
            return userData;
        }
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
    logout: async () => {
        // Attempt to tell backend to unbind this token for the current tab
        try {
            const userStr = sessionStorage.getItem('user');
            const token = userStr ? (JSON.parse(userStr).accessToken || JSON.parse(userStr).token) : null;
            await api.post('/auth/logout', {}, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : undefined,
                }
            });
        } catch (err) {
            // ignore
        }
        sessionStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser: () => {
        const userStr = sessionStorage.getItem('user');
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
