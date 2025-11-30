import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Ensure there's a tabId in sessionStorage (per-tab)
const ensureTabId = () => {
    try {
        let tabId = sessionStorage.getItem('tabId');
        if (!tabId) {
            // simple UUID v4
            tabId = 'tab-' + ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (
                c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
            sessionStorage.setItem('tabId', tabId);
        }
        return tabId;
    } catch (err) {
        // fallback if crypto unavailable
        const fallback = 'tab-' + Math.random().toString(36).slice(2);
        try { sessionStorage.setItem('tabId', fallback); } catch (e) {}
        return fallback;
    }
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token and tab id to every request
api.interceptors.request.use(
    (config) => {
        const tabId = ensureTabId();
        config.headers['X-Tab-ID'] = tabId;

        const user = sessionStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);

            console.log(`[API] Making request to: ${config.method?.toUpperCase()} ${config.url}`);
            console.log('[API] User data:', { id: userData.id, role: userData.role, name: userData.name });

            if (userData.accessToken || userData.token) {
                const token = userData.accessToken || userData.token;
                config.headers['Authorization'] = `Bearer ${token}`;
            }
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
            sessionStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;