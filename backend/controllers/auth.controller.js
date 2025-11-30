const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const crypto = require('crypto');
const emailService = require('../services/email.service');
const jwt = require('jsonwebtoken');
const tabSessions = require('../services/tabSessions');

// Register new user
exports.register = async (req, res) => {
    const { name, username, email, password, role } = req.body;

    try {
        // Check if email already exists
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(400).send({ message: 'Failed! Email is already in use.' });
        }

        // Check if username already exists
        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
            return res.status(400).send({ message: 'Failed! Username is already taken.' });
        }

        // Validate role
        const validRoles = ['user', 'doctor', 'staff', 'admin'];
        const userRole = role && validRoles.includes(role) ? role : 'user';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            role: userRole
        });

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        await User.setVerificationToken(userId, verificationToken);

        // Send verification email via Mailpit
        try {
            await emailService.sendVerificationEmail(email, name, verificationToken);
            console.log(`Verification email sent to ${email}`);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).send({ 
            message: 'User registered successfully! Please check your email to verify your account.',
            userId,
            email
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Login user
exports.login = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        // Find user by email or username
        const user = await User.findByEmailOrUsername(identifier);
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        // Check if user uses Google OAuth (no password)
        if (!user.password && user.google_id) {
            return res.status(401).send({ message: 'Please login with Google.' });
        }

        // Verify password
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({
                message: 'Invalid Password!'
            });
        }

        // Check if account is suspended
        if (user.is_suspended) {
            return res.status(403).send({
                message: `Your account has been suspended. Reason: ${user.suspension_reason || 'No reason provided.'}`,
                suspended: true,
                suspended_at: user.suspended_at,
                suspension_reason: user.suspension_reason
            });
        }

        // Check if email is verified
        if (!user.email_verified_at && !user.google_id) {
            return res.status(403).send({
                message: 'Please verify your email before logging in.',
                email_verified: false,
                email: user.email
            });
        }

        // On successful login, issue JWT and bind to tab id if provided
        const payload = {
            id: user.id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

        // Read tab id header
        const tabId = req.headers['x-tab-id'] || req.headers['x_tab_id'] || req.headers['X-Tab-ID'];
        if (tabId) {
            tabSessions.bindTokenToTab(token, tabId);
        }

        // Send user data + token
        res.status(200).send({
            id: user.id,
            name: user.full_name || user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            email_verified: !!user.email_verified_at,
            accessToken: token
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// OAuth login exchange endpoint: accept email and return JWT bound to tab
exports.oauthLogin = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) return res.status(400).send({ message: 'Email required' });
        const user = await User.findByEmail(email);
        if (!user) return res.status(404).send({ message: 'User not found' });

        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
        const tabId = req.headers['x-tab-id'] || req.headers['x_tab_id'] || req.headers['X-Tab-ID'];
        if (tabId) tabSessions.bindTokenToTab(token, tabId);

        res.status(200).send({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            email_verified: !!user.email_verified_at,
            accessToken: token
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Logout: unbind token for current tab
exports.logout = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(400).send({ message: 'No token provided' });
        tabSessions.unbindToken(token);
        return res.status(200).send({ message: 'Logged out for this tab' });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};

// Google OAuth Callback
exports.googleCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }

    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI;

        // Exchange authorization code for access token
        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const tokenData = {
            code: code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        };

        const tokenResponse = await axios.post(tokenUrl, new URLSearchParams(tokenData), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token } = tokenResponse.data;

        if (!access_token) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
        }

        // Get user info using access token
        const userinfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
        const userInfoResponse = await axios.get(userinfoUrl, {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const data = userInfoResponse.data;

        if (!data.email) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
        }

        const userEmail = data.email;
        const userName = data.name || data.email;
        const googleId = data.id;

        // Check if user exists
        let existingUser = await User.findByEmail(userEmail);

        if (existingUser) {
            // User exists, log them in
            const userData = {
                id: existingUser.id,
                name: existingUser.name,
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role,
                email_verified: true
            };

            // Redirect to frontend with user data
            const userDataEncoded = encodeURIComponent(JSON.stringify(userData));
            return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?user=${userDataEncoded}`);
        } else {
            // Create new user
            const username = userEmail.split('@')[0] + Math.floor(Math.random() * 1000);
            const userId = await User.create({
                name: userName,
                username: username,
                email: userEmail,
                password: null,
                google_id: googleId,
                email_verified_at: new Date(),
                role: 'user'
            });

            const newUser = await User.findById(userId);
            const userData = {
                id: newUser.id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                email_verified: true
            };

            // Redirect to frontend with user data
            const userDataEncoded = encodeURIComponent(JSON.stringify(userData));
            return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?user=${userDataEncoded}`);
        }
    } catch (error) {
        console.error('Google OAuth error:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
    }
};

// Get Google OAuth URL
exports.getGoogleAuthUrl = (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const scope = 'email profile';

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

    res.status(200).send({ url: googleAuthUrl });
};

// Verify email with token
exports.verifyEmail = async (req, res) => {
    const { token } = req.body;

    try {
        // Find user by verification token
        const user = await User.findByVerificationToken(token);
        
        if (!user) {
            return res.status(400).send({ message: 'Invalid or expired verification token.' });
        }

        // Check if already verified
        if (user.email_verified_at) {
            return res.status(400).send({ message: 'Email already verified.' });
        }

        // Verify email
        await User.verifyEmail(user.id);
        
        // Send welcome email
        try {
            await emailService.sendWelcomeEmail(user.email, user.name);
            console.log(`Welcome email sent to ${user.email}`);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail verification if email fails
        }
        
        res.status(200).send({ 
            message: 'Email verified successfully! You can now login.',
            email: user.email
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }
        res.status(200).send(user);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    const { name, username } = req.body;

    try {
        // Check if username is taken by another user
        const existingUser = await User.findByUsername(username);
        if (existingUser && existingUser.id !== req.userId) {
            return res.status(400).send({ message: 'Username is already taken.' });
        }

        await User.update(req.userId, { name, username });
        res.status(200).send({ message: 'Profile updated successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};