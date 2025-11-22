const controller = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

module.exports = function (app) {
    // Set up headers for all auth routes
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Authorization, Origin, Content-Type, Accept"
        );
        next();
    });

    // POST /api/auth/register - Register new user
    app.post('/api/auth/register', controller.register);

    // POST /api/auth/login - Login user
    app.post('/api/auth/login', controller.login);

    // GET /api/auth/google - Get Google OAuth URL
    app.get('/api/auth/google', controller.getGoogleAuthUrl);

    // GET /api/auth/google/callback - Google OAuth callback
    app.get('/api/auth/google/callback', controller.googleCallback);

    // POST /api/auth/verify-email - Verify email with token
    app.post('/api/auth/verify-email', controller.verifyEmail);

    // GET /api/auth/profile - Get current user profile (protected)
    app.get('/api/auth/profile', verifyToken, controller.getProfile);

    // PUT /api/auth/profile - Update user profile (protected)
    app.put('/api/auth/profile', verifyToken, controller.updateProfile);
};