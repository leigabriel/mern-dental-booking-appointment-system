const controller = require('../controllers/appointment.controller');
const { verifyToken, isAdminOrStaff } = require('../middleware/auth.middleware');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Authorization, Origin, Content-Type, Accept"
        );
        next();
    });

    // POST /api/appointments - Create new appointment (authenticated users)
    app.post('/api/appointments', verifyToken, controller.createAppointment);

    // GET /api/appointments/my - Get user's appointments (authenticated)
    app.get('/api/appointments/my', verifyToken, controller.getUserAppointments);

    // GET /api/appointments/booked-slots - Get booked time slots
    app.get('/api/appointments/booked-slots', controller.getBookedSlots);

    // GET /api/appointments/all - Get all appointments (admin/staff only)
    app.get('/api/appointments/all', [verifyToken, isAdminOrStaff], controller.getAllAppointments);

    // GET /api/appointments - Get all appointments (admin/staff only)
    app.get('/api/appointments', [verifyToken, isAdminOrStaff], controller.getAllAppointments);

    // GET /api/appointments/month - Get appointments by month (admin/staff only)
    app.get('/api/appointments/month', [verifyToken, isAdminOrStaff], controller.getAppointmentsByMonth);

    // GET /api/appointments/json - Get appointments in JSON format for calendar (admin/staff only)
    app.get('/api/appointments/json', [verifyToken, isAdminOrStaff], controller.getAppointmentsJson);

    // GET /api/appointments/:id - Get appointment by ID
    app.get('/api/appointments/:id', verifyToken, controller.getAppointmentById);

    // PUT /api/appointments/:id/status - Update appointment status (admin/staff only)
    app.put('/api/appointments/:id/status', [verifyToken, isAdminOrStaff], controller.updateAppointmentStatus);

    // PUT /api/appointments/:id/confirm - Confirm appointment (admin/staff only)
    app.put('/api/appointments/:id/confirm', [verifyToken, isAdminOrStaff], controller.confirmAppointment);

    // PUT /api/appointments/:id/decline - Decline appointment with message (admin/staff only)
    app.put('/api/appointments/:id/decline', [verifyToken, isAdminOrStaff], controller.declineAppointment);

    // PUT /api/appointments/:id/cancel - Cancel appointment
    app.put('/api/appointments/:id/cancel', verifyToken, controller.cancelAppointment);

    // PUT /api/appointments/:id/mark-paid - Mark payment as paid (admin/staff only)
    app.put('/api/appointments/:id/mark-paid', [verifyToken, isAdminOrStaff], controller.markAsPaid);

    // PUT /api/appointments/:id/payment - Update payment status (admin/staff only)
    app.put('/api/appointments/:id/payment', [verifyToken, isAdminOrStaff], controller.updatePaymentStatus);

    // DELETE /api/appointments/clear-history - Clear user's appointment history
    app.delete('/api/appointments/clear-history', verifyToken, controller.clearHistory);

    // DELETE /api/appointments/:id - Delete appointment (admin only)
    app.delete('/api/appointments/:id', [verifyToken, isAdminOrStaff], controller.deleteAppointment);
};
