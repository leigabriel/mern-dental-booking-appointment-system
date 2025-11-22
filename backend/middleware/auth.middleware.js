// Verify user ID from request body/headers
const verifyToken = (req, res, next) => {
    const userId = req.headers['x-user-id'] || req.body.userId;
    const userRole = req.headers['x-user-role'] || req.body.userRole;

    console.log(`[Auth Middleware] ========================================`);
    console.log(`[Auth Middleware] Request: ${req.method} ${req.path}`);
    console.log(`[Auth Middleware] Raw User ID from headers: ${req.headers['x-user-id']}`);
    console.log(`[Auth Middleware] Raw User Role from headers: ${req.headers['x-user-role']}`);
    console.log(`[Auth Middleware] User ID: ${userId}, Role: ${userRole}`);

    if (!userId) {
        console.error('[Auth Middleware] ERROR: No user ID provided!');
        console.log(`[Auth Middleware] ========================================`);
        return res.status(403).send({ message: 'No user ID provided!' });
    }

    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
        console.error(`[Auth Middleware] ERROR: Invalid user ID: ${userId}`);
        console.log(`[Auth Middleware] ========================================`);
        return res.status(403).send({ message: 'Invalid user ID format!' });
    }

    req.userId = parsedUserId;
    req.userRole = userRole;
    console.log(`[Auth Middleware] ✅ Request authorized for user ${req.userId} (${req.userRole})`);
    console.log(`[Auth Middleware] ========================================`);
    next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).send({ message: 'Require Admin Role!' });
    }
    next();
};

// Check if user is admin or staff
const isAdminOrStaff = (req, res, next) => {
    if (req.userRole !== 'admin' && req.userRole !== 'staff') {
        return res.status(403).send({ message: 'Require Admin or Staff Role!' });
    }
    next();
};

// Check if user is a doctor
const isDoctor = (req, res, next) => {
    if (req.userRole !== 'doctor') {
        return res.status(403).send({ message: 'Require Doctor Role!' });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin,
    isAdminOrStaff,
    isDoctor
};
