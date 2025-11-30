const jwt = require('jsonwebtoken');
const tabSessions = require('../services/tabSessions');

// Verify JWT and tab binding
const verifyToken = (req, res, next) => {
    console.log(`[Auth Middleware] ========================================`);
    console.log(`[Auth Middleware] Request: ${req.method} ${req.path}`);

    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
        console.error('[Auth Middleware] ERROR: No Authorization header provided!');
        console.log(`[Auth Middleware] ========================================`);
        return res.status(403).send({ message: 'No token provided!' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        console.error('[Auth Middleware] ERROR: Malformed Authorization header');
        return res.status(403).send({ message: 'Malformed token' });
    }

    const tabId = req.headers['x-tab-id'] || req.headers['x_tab_id'] || req.headers['X-Tab-ID'];
    if (!tabId) {
        console.error('[Auth Middleware] ERROR: No X-Tab-ID header provided!');
        return res.status(403).send({ message: 'No tab id provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        // Check token->tab binding
        if (!tabSessions.isTokenAllowedForTab(token, tabId)) {
            console.error('[Auth Middleware] ERROR: Token is not allowed for this tab');
            return res.status(403).send({ message: 'Token not allowed for this tab' });
        }

        req.userId = decoded.id;
        req.userRole = decoded.role;
        console.log(`[Auth Middleware] ✅ Request authorized for user ${req.userId} (${req.userRole}) on tab ${tabId}`);
        console.log(`[Auth Middleware] ========================================`);
        next();
    } catch (err) {
        console.error('[Auth Middleware] ERROR: Token verification failed', err.message);
        return res.status(401).send({ message: 'Unauthorized' });
    }
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
