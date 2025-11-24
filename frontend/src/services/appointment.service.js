import api from './api';

const appointmentService = {
    // Create new appointment
    create: async (appointmentData) => {
        const response = await api.post('/appointments', appointmentData);
        return response.data;
    },

    // Get user's appointments
    getMyAppointments: async () => {
        const response = await api.get('/appointments/my');
        return response.data;
    },

    // Get all appointments (admin/staff only)
    getAll: async () => {
        const response = await api.get('/appointments');
        return response.data;
    },

    // Get appointment by ID
    getById: async (id) => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },

    // Get booked time slots
    getBookedSlots: async (doctorId, date) => {
        const response = await api.get('/appointments/booked-slots', {
            params: { doctor_id: doctorId, date }
        });
        return response.data;
    },

    // Update appointment status (admin/staff only)
    updateStatus: async (id, status) => {
        const response = await api.put(`/appointments/${id}/status`, { status });
        return response.data;
    },

    // Cancel appointment
    cancel: async (id) => {
        const response = await api.put(`/appointments/${id}/cancel`);
        return response.data;
    },

    // Update payment status (admin/staff only)
    updatePayment: async (id, paymentData) => {
        const response = await api.put(`/appointments/${id}/payment`, paymentData);
        return response.data;
    },

    // Get appointments by month (admin/staff only)
    getByMonth: async (month, year) => {
        const response = await api.get('/appointments/month', {
            params: { month, year }
        });
        return response.data;
    },

    // Clear appointment history (delete pending, cancelled, declined)
    clearHistory: async () => {
        const response = await api.delete('/appointments/clear-history');
        return response.data;
    },
};

export default appointmentService;
