const controller = require('../controllers/doctor.controller');
const { verifyToken, isAdmin, isAdminOrStaff, isDoctor } = require('../middleware/auth.middleware');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Authorization, Origin, Content-Type, Accept"
        );
        next();
    });

    // ========================================
    // IMPORTANT: Specific routes MUST come before parameterized routes (:id)
    // Otherwise /api/doctors/my-profile will match /api/doctors/:id
    // ========================================

    // Doctor-specific routes (logged-in doctor only) - MUST BE FIRST
    // GET /api/doctors/my-appointments - Get appointments for logged-in doctor
    app.get('/api/doctors/my-appointments', [verifyToken, isDoctor], controller.getMyAppointments);

    // GET /api/doctors/my-profile - Get logged-in doctor's profile
    app.get('/api/doctors/my-profile', [verifyToken, isDoctor], controller.getMyProfile);

    // PUT /api/doctors/my-profile - Update logged-in doctor's profile
    app.put('/api/doctors/my-profile', [verifyToken, isDoctor], controller.updateMyProfile);

    // DELETE /api/doctors/my-profile - Delete logged-in doctor's account
    app.delete('/api/doctors/my-profile', [verifyToken, isDoctor], controller.deleteMyAccount);

    // PUT /api/doctors/appointments/:id/confirm - Confirm appointment
    app.put('/api/doctors/appointments/:id/confirm', [verifyToken, isDoctor], controller.confirmAppointment);

    // PUT /api/doctors/appointments/:id/decline - Decline appointment
    app.put('/api/doctors/appointments/:id/decline', [verifyToken, isDoctor], controller.declineAppointment);

    // PUT /api/doctors/my-availability - Update logged-in doctor's availability
    app.put('/api/doctors/my-availability', [verifyToken, isDoctor], controller.updateMyAvailability);

    // GET /api/doctors/with-users/all - Get all doctors with linked user accounts (admin and staff)
    app.get('/api/doctors/with-users/all', [verifyToken, isAdminOrStaff], controller.getAllDoctorsWithUsers);

    // POST /api/doctors/link - Link doctor profile to user account (admin only)
    app.post('/api/doctors/link', [verifyToken, isAdmin], controller.linkDoctorToUser);

    // General doctor routes (public/admin)
    // GET /api/doctors - Get all doctors (public)
    app.get('/api/doctors', controller.getAllDoctors);

    // POST /api/doctors - Create new doctor (admin and staff)
    app.post('/api/doctors', [verifyToken, isAdminOrStaff], controller.createDoctor);

    // ========================================
    // Parameterized routes - MUST BE LAST
    // ========================================

    // GET /api/doctors/:id - Get doctor by ID (public)
    app.get('/api/doctors/:id', controller.getDoctorById);

    // PUT /api/doctors/:id - Update doctor (admin and staff)
    app.put('/api/doctors/:id', [verifyToken, isAdminOrStaff], controller.updateDoctor);

    // PUT /api/doctors/:id/availability - Update doctor availability (admin, staff, or the doctor themselves)
    app.put('/api/doctors/:id/availability', [verifyToken, isAdminOrStaff], controller.updateAvailability);

    // DELETE /api/doctors/:id - Delete doctor (admin only)
    app.delete('/api/doctors/:id', [verifyToken, isAdmin], controller.deleteDoctor);
};
