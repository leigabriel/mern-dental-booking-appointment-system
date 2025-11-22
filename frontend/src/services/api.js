import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add user ID and role to requests if they exist
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            
            console.log(`[API] Making request to: ${config.method?.toUpperCase()} ${config.url}`);
            console.log('[API] User data:', { id: userData.id, role: userData.role, name: userData.name });
            
            // Add authorization token if available
            if (userData.accessToken) {
                config.headers['x-access-token'] = userData.accessToken;
            }
            
            config.headers['x-user-id'] = userData.id;
            config.headers['x-user-role'] = userData.role;
        } else {
            console.log(`[API] Making unauthenticated request to: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - token expired or invalid
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        // Don't auto-redirect on 403 - let components handle permission errors
        return Promise.reject(error);
    }
);

export default api;
