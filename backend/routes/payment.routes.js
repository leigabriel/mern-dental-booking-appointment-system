const controller = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Authorization, Origin, Content-Type, Accept"
        );
        next();
    });

    // GCash Payment Routes
    app.post('/api/payment/gcash/:appointment_id', verifyToken, controller.createGCashPayment);
    app.post('/api/payment/gcash/success/:appointment_id', verifyToken, controller.gcashSuccess);
    app.post('/api/payment/gcash/failed/:appointment_id', verifyToken, controller.gcashFailed);

    // PayPal Payment Routes
    app.post('/api/payment/paypal/:appointment_id', verifyToken, controller.createPayPalPayment);
    app.post('/api/payment/paypal/success/:appointment_id', verifyToken, controller.paypalSuccess);
    app.post('/api/payment/paypal/cancel/:appointment_id', verifyToken, controller.paypalCancel);
};
