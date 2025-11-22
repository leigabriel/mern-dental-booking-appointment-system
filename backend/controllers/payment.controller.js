const Appointment = require('../models/appointment.model');
const axios = require('axios');

// PayMongo Configuration (Sandbox)
const PAYMONGO_API_KEY = process.env.PAYMONGO_API_KEY;
const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';

// PayPal Configuration (Sandbox)
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_BASE_URL = 'https://api-m.sandbox.paypal.com';

// Frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// GCash Payment via PayMongo
exports.createGCashPayment = async (req, res) => {
    const { appointment_id } = req.params;

    try {
        // Get appointment details
        const appointment = await Appointment.findById(appointment_id);

        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }

        // Check if user owns this appointment
        if (appointment.user_id !== req.userId) {
            return res.status(403).send({ message: 'Access denied.' });
        }

        // Convert price to cents
        const amount = Math.round(appointment.price * 100);

        // Create PayMongo Source for GCash
        const data = {
            data: {
                attributes: {
                    amount: amount,
                    redirect: {
                        success: `${FRONTEND_URL}/payment/gcash/success/${appointment_id}`,
                        failed: `${FRONTEND_URL}/payment/gcash/failed/${appointment_id}`
                    },
                    type: 'gcash',
                    currency: 'PHP'
                }
            }
        };

        const auth = Buffer.from(`${PAYMONGO_API_KEY}:`).toString('base64');

        const response = await axios.post(`${PAYMONGO_BASE_URL}/sources`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            }
        });

        if (response.status === 200 && response.data.data) {
            const checkout_url = response.data.data.attributes.redirect.checkout_url;
            const source_id = response.data.data.id;

            // Update appointment with payment reference
            await Appointment.updatePaymentReference(appointment_id, source_id);

            res.status(200).send({
                success: true,
                checkout_url: checkout_url,
                source_id: source_id
            });
        } else {
            res.status(400).send({ message: 'Failed to create GCash payment source.' });
        }
    } catch (err) {
        console.error('GCash Payment Error:', err.response?.data || err.message);
        res.status(500).send({
            message: 'Failed to initiate GCash payment. Please try again or choose a different payment method.',
            error: err.response?.data || err.message
        });
    }
};

// GCash Payment Success Callback
exports.gcashSuccess = async (req, res) => {
    const { appointment_id } = req.params;

    try {
        const appointment = await Appointment.findById(appointment_id);

        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }

        // Check if user owns this appointment
        if (appointment.user_id !== req.userId) {
            return res.status(403).send({ message: 'Access denied.' });
        }

        // Update payment status to paid
        await Appointment.updatePaymentStatus(appointment_id, 'paid', appointment.payment_reference);

        res.status(200).send({
            success: true,
            message: 'Payment successful! Your appointment is confirmed and awaiting admin approval.'
        });
    } catch (err) {
        console.error('GCash Success Error:', err);
        res.status(500).send({ message: err.message });
    }
};

// GCash Payment Failed Callback
exports.gcashFailed = async (req, res) => {
    const { appointment_id } = req.params;

    try {
        const appointment = await Appointment.findById(appointment_id);

        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }

        // Update payment status to failed
        await Appointment.updatePaymentStatus(appointment_id, 'failed', appointment.payment_reference);

        res.status(200).send({
            success: false,
            message: 'GCash payment was cancelled or failed. Your appointment is still pending. Please try again.'
        });
    } catch (err) {
        console.error('GCash Failed Error:', err);
        res.status(500).send({ message: err.message });
    }
};

// PayPal Payment - Get Access Token
const getPayPalAccessToken = async () => {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');

    const response = await axios.post(`${PAYPAL_BASE_URL}/v1/oauth2/token`, 'grant_type=client_credentials', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`
        }
    });

    return response.data.access_token;
};

// Create PayPal Payment
exports.createPayPalPayment = async (req, res) => {
    const { appointment_id } = req.params;

    try {
        // Get appointment details
        const appointment = await Appointment.findById(appointment_id);

        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }

        // Check if user owns this appointment
        if (appointment.user_id !== req.userId) {
            return res.status(403).send({ message: 'Access denied.' });
        }

        // Get PayPal access token
        const access_token = await getPayPalAccessToken();

        if (!access_token) {
            return res.status(500).send({ message: 'Failed to connect to PayPal.' });
        }

        // Format amount
        const amount = Number(appointment.price).toFixed(2);

        // Create PayPal Order
        const order_data = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'PHP',
                    value: amount
                },
                description: `Dental Appointment - ${appointment.service_name}`
            }],
            application_context: {
                return_url: `${FRONTEND_URL}/payment/paypal/success/${appointment_id}`,
                cancel_url: `${FRONTEND_URL}/payment/paypal/cancel/${appointment_id}`
            }
        };

        const response = await axios.post(`${PAYPAL_BASE_URL}/v2/checkout/orders`, order_data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            }
        });

        if (response.status === 201 && response.data.id) {
            const approve_url = response.data.links.find(link => link.rel === 'approve')?.href;

            if (approve_url) {
                // Store PayPal order ID
                await Appointment.updatePaymentReference(appointment_id, response.data.id);

                res.status(200).send({
                    success: true,
                    checkout_url: approve_url,
                    order_id: response.data.id
                });
            } else {
                res.status(400).send({ message: 'Failed to get PayPal approval URL.' });
            }
        } else {
            res.status(400).send({ message: 'Failed to create PayPal order.' });
        }
    } catch (err) {
        console.error('PayPal Payment Error:', err.response?.data || err.message);
        res.status(500).send({
            message: 'Failed to initiate PayPal payment. Please try again or choose a different payment method.',
            error: err.response?.data || err.message
        });
    }
};

// PayPal Payment Success Callback
exports.paypalSuccess = async (req, res) => {
    const { appointment_id } = req.params;
    const { token } = req.query;

    try {
        const appointment = await Appointment.findById(appointment_id);

        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }

        // Check if user owns this appointment
        if (appointment.user_id !== req.userId) {
            return res.status(403).send({ message: 'Access denied.' });
        }

        if (!token) {
            return res.status(400).send({ message: 'PayPal order ID not provided.' });
        }

        // Get PayPal access token
        const access_token = await getPayPalAccessToken();

        if (!access_token) {
            return res.status(500).send({ message: 'Failed to connect to PayPal.' });
        }

        // Capture the payment
        const response = await axios.post(
            `${PAYPAL_BASE_URL}/v2/checkout/orders/${token}/capture`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                }
            }
        );

        if (response.status === 201) {
            // Payment captured successfully
            await Appointment.updatePaymentStatus(appointment_id, 'paid', token);

            res.status(200).send({
                success: true,
                message: 'PayPal payment successful! Your appointment is confirmed and awaiting admin approval.'
            });
        } else {
            res.status(400).send({ message: 'Failed to capture PayPal payment.' });
        }
    } catch (err) {
        console.error('PayPal Success Error:', err.response?.data || err.message);
        res.status(500).send({
            message: 'Failed to process PayPal payment. Please contact support.',
            error: err.response?.data || err.message
        });
    }
};

// PayPal Payment Cancelled Callback
exports.paypalCancel = async (req, res) => {
    const { appointment_id } = req.params;

    try {
        const appointment = await Appointment.findById(appointment_id);

        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }

        // Update payment status to failed
        await Appointment.updatePaymentStatus(appointment_id, 'failed', appointment.payment_reference);

        res.status(200).send({
            success: false,
            message: 'PayPal payment was cancelled. Your appointment is still pending. Please try again.'
        });
    } catch (err) {
        console.error('PayPal Cancel Error:', err);
        res.status(500).send({ message: err.message });
    }
};
