import api from './api';

const serviceService = {
    // Get all services
    getAll: async () => {
        const response = await api.get('/services');
        return response.data;
    },

    // Get all services (returns full response)
    getAllServices: async () => {
        return await api.get('/services');
    },

    // Get service by ID
    getById: async (id) => {
        const response = await api.get(`/services/${id}`);
        return response.data;
    },

    // Create service (admin only)
    createService: async (serviceData) => {
        const response = await api.post('/services', serviceData);
        return response.data;
    },

    // Update service (admin only)
    updateService: async (id, serviceData) => {
        const response = await api.put(`/services/${id}`, serviceData);
        return response.data;
    },

    // Delete service (admin only)
    deleteService: async (id) => {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    },
};

export default serviceService;
