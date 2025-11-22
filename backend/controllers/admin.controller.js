const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');
const Service = require('../models/service.model');
const bcrypt = require('bcryptjs');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const db = require('../config/db.config');

        // Get user counts by role
        const [users] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
        const [staff] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'staff'");
        const [admins] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        const [doctorUsers] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'doctor'");
        const [suspendedUsers] = await db.query("SELECT COUNT(*) as count FROM users WHERE is_suspended = 1");
        const [verifiedUsers] = await db.query("SELECT COUNT(*) as count FROM users WHERE email_verified_at IS NOT NULL");
        
        // Get appointment counts
        const [appointments] = await db.query("SELECT COUNT(*) as count FROM appointments");
        const [pendingAppointments] = await db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'");
        const [confirmedAppointments] = await db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'confirmed'");
        const [declinedAppointments] = await db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'declined'");
        const [cancelledAppointments] = await db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'");
        const [completedAppointments] = await db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'");
        
        // Get payment statistics
        const [paidAppointments] = await db.query("SELECT COUNT(*) as count FROM appointments WHERE payment_status = 'paid'");
        const [unpaidAppointments] = await db.query("SELECT COUNT(*) as count FROM appointments WHERE payment_status = 'unpaid'");
        const [pendingPayments] = await db.query("SELECT COUNT(*) as count FROM appointments WHERE payment_status = 'pending'");
        
        // Get resource counts
        const [doctors] = await db.query("SELECT COUNT(*) as count FROM doctors");
        const [services] = await db.query("SELECT COUNT(*) as count FROM services");
        
        // Get recent appointments (last 7 days)
        const [recentAppointments] = await db.query(
            "SELECT COUNT(*) as count FROM appointments WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
        );
        
        // Get today's appointments
        const [todayAppointments] = await db.query(
            "SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURDATE()"
        );

        res.status(200).send({
            // User statistics
            totalUsers: users[0].count,
            totalStaff: staff[0].count,
            totalAdmins: admins[0].count,
            totalDoctorUsers: doctorUsers[0].count,
            suspendedUsers: suspendedUsers[0].count,
            verifiedUsers: verifiedUsers[0].count,
            allUsers: users[0].count + staff[0].count + admins[0].count + doctorUsers[0].count,
            
            // Appointment statistics
            totalAppointments: appointments[0].count,
            pendingAppointments: pendingAppointments[0].count,
            confirmedAppointments: confirmedAppointments[0].count,
            declinedAppointments: declinedAppointments[0].count,
            cancelledAppointments: cancelledAppointments[0].count,
            completedAppointments: completedAppointments[0].count,
            recentAppointments: recentAppointments[0].count,
            todayAppointments: todayAppointments[0].count,
            
            // Payment statistics
            paidAppointments: paidAppointments[0].count,
            unpaidAppointments: unpaidAppointments[0].count,
            pendingPayments: pendingPayments[0].count,
            
            // Resource statistics
            totalDoctors: doctors[0].count,
            totalServices: services[0].count
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const db = require('../config/db.config');
        const [users] = await db.query('SELECT id, full_name, username, email, role, is_suspended, suspension_reason, suspended_at, created_at FROM users ORDER BY created_at DESC');
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Create admin or staff account
exports.createStaffAccount = async (req, res) => {
    const { full_name, username, email, password, role } = req.body;

    // Validate role
    if (role !== 'admin' && role !== 'staff') {
        return res.status(400).send({ message: 'Invalid role. Must be admin or staff.' });
    }

    try {
        // Check if email already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).send({ message: 'Failed! Email is already in use.' });
        }

        // Check if username already exists
        const db = require('../config/db.config');
        const [existingUsername] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsername.length > 0) {
            return res.status(400).send({ message: 'Failed! Username is already taken.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = await User.create({
            full_name: full_name,
            username: username,
            email,
            password: hashedPassword,
            role,
            email_verified_at: new Date()
        });

        res.status(201).send({ message: `${role} account created successfully!`, userId });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Update staff account
exports.updateStaffAccount = async (req, res) => {
    const { full_name, username, email, password, role } = req.body;

    // Validate role
    if (role && role !== 'admin' && role !== 'staff') {
        return res.status(400).send({ message: 'Invalid role. Must be admin or staff.' });
    }

    try {
        const db = require('../config/db.config');

        // Check if user exists
        const [users] = await db.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }

        // Check if email is being changed and already exists
        if (email) {
            const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.params.id]);
            if (existingEmail.length > 0) {
                return res.status(400).send({ message: 'Email is already in use.' });
            }
        }

        // Check if username is being changed and already exists
        if (username) {
            const [existingUsername] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, req.params.id]);
            if (existingUsername.length > 0) {
                return res.status(400).send({ message: 'Username is already taken.' });
            }
        }

        // Build update query
        let updateFields = [];
        let updateValues = [];

        if (full_name) {
            updateFields.push('full_name = ?');
            updateValues.push(full_name);
        }
        if (username) {
            updateFields.push('username = ?');
            updateValues.push(username);
        }
        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if (role) {
            updateFields.push('role = ?');
            updateValues.push(role);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).send({ message: 'No fields to update.' });
        }

        updateValues.push(req.params.id);
        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        await db.query(query, updateValues);

        res.status(200).send({ message: 'User updated successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Update user role
exports.updateUserRole = async (req, res) => {
    const { role } = req.body;

    // Validate role
    if (!['user', 'staff', 'admin'].includes(role)) {
        return res.status(400).send({ message: 'Invalid role.' });
    }

    try {
        const db = require('../config/db.config');
        const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }

        res.status(200).send({ message: 'User role updated successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const affectedRows = await User.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }
        res.status(200).send({ message: 'User deleted successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Suspend user account
exports.suspendUser = async (req, res) => {
    const { suspension_reason } = req.body;

    if (!suspension_reason || !suspension_reason.trim()) {
        return res.status(400).send({ message: 'Suspension reason is required.' });
    }

    try {
        const db = require('../config/db.config');
        
        // Check if user exists
        const [users] = await db.query('SELECT id, is_suspended FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }

        if (users[0].is_suspended) {
            return res.status(400).send({ message: 'User account is already suspended.' });
        }

        // Suspend the account
        await db.query(
            'UPDATE users SET is_suspended = 1, suspended_at = NOW(), suspension_reason = ? WHERE id = ?',
            [suspension_reason, req.params.id]
        );

        res.status(200).send({ message: 'User account suspended successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Unsuspend user account
exports.unsuspendUser = async (req, res) => {
    try {
        const db = require('../config/db.config');
        
        // Check if user exists
        const [users] = await db.query('SELECT id, is_suspended FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }

        if (!users[0].is_suspended) {
            return res.status(400).send({ message: 'User account is not suspended.' });
        }

        // Unsuspend the account
        await db.query(
            'UPDATE users SET is_suspended = 0, suspended_at = NULL, suspension_reason = NULL WHERE id = ?',
            [req.params.id]
        );

        res.status(200).send({ message: 'User account unsuspended successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
    const { role } = req.params;

    if (!['user', 'staff', 'admin', 'doctor'].includes(role)) {
        return res.status(400).send({ message: 'Invalid role.' });
    }

    try {
        const users = await User.getAllByRole(role);
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
