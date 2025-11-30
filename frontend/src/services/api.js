import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            
            console.log(`[API] Making request to: ${config.method?.toUpperCase()} ${config.url}`);
            console.log('[API] User data:', { id: userData.id, role: userData.role, name: userData.name });
            
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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;