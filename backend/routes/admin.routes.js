const controller = require('../controllers/admin.controller');
const { verifyToken, isAdmin, isAdminOrStaff } = require('../middleware/auth.middleware');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Authorization, Origin, Content-Type, Accept"
        );
        next();
    });

    // GET /api/admin/stats - Get dashboard statistics (admin and staff)
    app.get('/api/admin/stats', [verifyToken, isAdminOrStaff], controller.getDashboardStats);

    // GET /api/admin/users - Get all users (admin and staff)
    app.get('/api/admin/users', [verifyToken, isAdminOrStaff], controller.getAllUsers);

    // POST /api/admin/staff - Create admin/staff account (admin only)
    app.post('/api/admin/staff', [verifyToken, isAdmin], controller.createStaffAccount);

    // PUT /api/admin/staff/:id - Update staff account (admin only)
    app.put('/api/admin/staff/:id', [verifyToken, isAdmin], controller.updateStaffAccount);

    // PUT /api/admin/users/:id/role - Update user role (admin only)
    app.put('/api/admin/users/:id/role', [verifyToken, isAdmin], controller.updateUserRole);

    // PUT /api/admin/users/:id/suspend - Suspend user account (admin and staff)
    app.put('/api/admin/users/:id/suspend', [verifyToken, isAdminOrStaff], controller.suspendUser);

    // PUT /api/admin/users/:id/unsuspend - Unsuspend user account (admin and staff)
    app.put('/api/admin/users/:id/unsuspend', [verifyToken, isAdminOrStaff], controller.unsuspendUser);

    // GET /api/admin/users/role/:role - Get users by role (admin only)
    app.get('/api/admin/users/role/:role', [verifyToken, isAdmin], controller.getUsersByRole);

    // DELETE /api/admin/staff/:id - Delete user (admin only)
    app.delete('/api/admin/staff/:id', [verifyToken, isAdmin], controller.deleteUser);
};
