import api from './api';

const doctorService = {
    // Get all doctors
    getAll: async () => {
        const response = await api.get('/doctors');
        return response.data;
    },

    // Get doctor by ID
    getById: async (id) => {
        const response = await api.get(`/doctors/${id}`);
        return response.data;
    },

    // Create doctor (admin only)
    create: async (doctorData) => {
        const response = await api.post('/doctors', doctorData);
        return response.data;
    },

    // Update doctor (admin only)
    update: async (id, doctorData) => {
        const response = await api.put(`/doctors/${id}`, doctorData);
        return response.data;
    },

    // Delete doctor (admin only)
    delete: async (id) => {
        const response = await api.delete(`/doctors/${id}`);
        return response.data;
    },

    // Update doctor availability (admin, staff, or doctor)
    updateAvailability: async (id, isAvailable) => {
        const response = await api.put(`/doctors/${id}/availability`, { 
            is_available: isAvailable 
        });
        return response.data;
    },

    // Update logged-in doctor's availability
    updateMyAvailability: async (isAvailable) => {
        const response = await api.put('/doctors/my-availability', { 
            is_available: isAvailable 
        });
        return response.data;
    },
};

export default doctorService;
