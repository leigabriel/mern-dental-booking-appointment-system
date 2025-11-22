import api from './api';

const paymentService = {
    // Create GCash payment
    createGCashPayment: async (appointmentId) => {
        const response = await api.post(`/payment/gcash/${appointmentId}`);
        return response.data;
    },

    // GCash success callback
    gcashSuccess: async (appointmentId) => {
        const response = await api.post(`/payment/gcash/success/${appointmentId}`);
        return response.data;
    },

    // GCash failed callback
    gcashFailed: async (appointmentId) => {
        const response = await api.post(`/payment/gcash/failed/${appointmentId}`);
        return response.data;
    },

    // Create PayPal payment
    createPayPalPayment: async (appointmentId) => {
        const response = await api.post(`/payment/paypal/${appointmentId}`);
        return response.data;
    },

    // PayPal success callback
    paypalSuccess: async (appointmentId, token) => {
        const response = await api.post(`/payment/paypal/success/${appointmentId}?token=${token}`);
        return response.data;
    },

    // PayPal cancel callback
    paypalCancel: async (appointmentId) => {
        const response = await api.post(`/payment/paypal/cancel/${appointmentId}`);
        return response.data;
    }
};

export default paymentService;
