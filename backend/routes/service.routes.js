const controller = require('../controllers/service.controller');
const { verifyToken, isAdmin, isAdminOrStaff } = require('../middleware/auth.middleware');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Authorization, Origin, Content-Type, Accept"
        );
        next();
    });

    // GET /api/services - Get all services (public)
    app.get('/api/services', controller.getAllServices);

    // GET /api/services/:id - Get service by ID (public)
    app.get('/api/services/:id', controller.getServiceById);

    // POST /api/services - Create new service (admin and staff)
    app.post('/api/services', [verifyToken, isAdminOrStaff], controller.createService);

    // PUT /api/services/:id - Update service (admin and staff)
    app.put('/api/services/:id', [verifyToken, isAdminOrStaff], controller.updateService);

    // DELETE /api/services/:id - Delete service (admin and staff)
    app.delete('/api/services/:id', [verifyToken, isAdminOrStaff], controller.deleteService);
};