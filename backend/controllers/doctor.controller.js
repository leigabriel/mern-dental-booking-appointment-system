const Doctor = require('../models/doctor.model');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const db = require('../config/db.config');

// Helper function to get or create doctor profile
async function getOrCreateDoctorProfile(userId) {
    try {
        console.log(`Looking for doctor profile for user ID: ${userId}`);
        
        // Try to find existing doctor profile
        let doctor = await Doctor.findByUserId(userId);
        
        if (doctor) {
            console.log(`Found existing doctor profile: ${doctor.id}`);
            return doctor;
        }
        
        console.log(`No doctor profile found for user ${userId}, checking user...`);
        
        // If not found, check if user exists and has doctor role
        const user = await User.findById(userId);
        
        if (!user) {
            console.error(`User ${userId} not found in database`);
            throw new Error('User not found');
        }
        
        console.log(`User found: ${user.username}, role: ${user.role}`);
        
        if (user.role !== 'doctor') {
            console.error(`User ${userId} has role '${user.role}', not 'doctor'`);
            throw new Error('User is not a doctor');
        }
        
        // Auto-create doctor profile for this user
        console.log(`Auto-creating doctor profile for user ${userId} (${user.full_name || user.name})`);
        const doctorId = await Doctor.create({
            user_id: userId,
            name: user.full_name || user.name,
            specialty: 'General Dentistry', // Default specialty
            email: user.email
        });
        
        console.log(`Doctor profile created with ID: ${doctorId}`);
        
        // Fetch the newly created doctor profile
        doctor = await Doctor.findById(doctorId);
        
        if (!doctor) {
            console.error(`Failed to fetch newly created doctor profile ${doctorId}`);
            throw new Error('Failed to create doctor profile');
        }
        
        console.log(`Successfully created and retrieved doctor profile: ${doctor.id}`);
        return doctor;
    } catch (error) {
        console.error('Error in getOrCreateDoctorProfile:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    }
}

// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.getAll();
        res.status(200).send(doctors);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get all doctors with linked user accounts (Admin only)
exports.getAllDoctorsWithUsers = async (req, res) => {
    try {
        const doctors = await Doctor.getAllWithUsers();
        res.status(200).send(doctors);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).send({ message: 'Doctor not found.' });
        }
        res.status(200).send(doctor);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Create new doctor (Admin only)
exports.createDoctor = async (req, res) => {
    const { name, specialty, email, username, password } = req.body;

    try {
        let userId = null;

        // Create user account if username and password provided
        if (username && password) {
            // Check if username already exists
            const existingUsername = await User.findByUsername(username);
            if (existingUsername) {
                return res.status(400).send({ message: 'Username is already taken.' });
            }

            // Check if email already exists
            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                return res.status(400).send({ message: 'Email is already in use.' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user account
            userId = await User.create({
                name,
                username,
                email,
                password: hashedPassword,
                role: 'doctor',
                email_verified_at: new Date() // Auto-verify admin-created accounts
            });
        }

        // Create doctor profile
        const doctorId = await Doctor.create({
            user_id: userId,
            name,
            specialty,
            email
        });

        res.status(201).send({ 
            message: 'Doctor created successfully!', 
            doctorId,
            userId 
        });
    } catch (err) {
        console.error('Create doctor error:', err);
        res.status(500).send({ message: err.message || 'Error creating doctor' });
    }
};

// Update doctor (Admin only)
exports.updateDoctor = async (req, res) => {
    const { name, specialty, email, username, password } = req.body;

    try {
        // Get existing doctor
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).send({ message: 'Doctor not found.' });
        }

        // Update doctor profile
        await Doctor.update(req.params.id, {
            name,
            specialty,
            email
        });

        // Update or create user account if username provided
        if (username) {
            if (doctor.user_id) {
                // Update existing user account
                const updateData = { name, username };
                
                // Update password if provided
                if (password) {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    await db.query('UPDATE users SET full_name = ?, username = ?, password = ? WHERE id = ?', 
                        [name, username, hashedPassword, doctor.user_id]);
                } else {
                    await db.query('UPDATE users SET full_name = ?, username = ? WHERE id = ?', 
                        [name, username, doctor.user_id]);
                }
            } else if (password) {
                // Create new user account if password also provided
                const existingUsername = await User.findByUsername(username);
                if (existingUsername) {
                    return res.status(400).send({ message: 'Username is already taken.' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const userId = await User.create({
                    name,
                    username,
                    email,
                    password: hashedPassword,
                    role: 'doctor',
                    email_verified_at: new Date()
                });

                // Link user to doctor
                await Doctor.linkUser(req.params.id, userId);
            }
        }

        res.status(200).send({ message: 'Doctor updated successfully!' });
    } catch (err) {
        console.error('Update doctor error:', err);
        res.status(500).send({ message: err.message || 'Error updating doctor' });
    }
};

// Delete doctor (Admin only)
exports.deleteDoctor = async (req, res) => {
    try {
        const affectedRows = await Doctor.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).send({ message: 'Doctor not found.' });
        }
        res.status(200).send({ message: 'Doctor deleted successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get appointments for logged-in doctor
exports.getMyAppointments = async (req, res) => {
    try {
        console.log(`getMyAppointments called for user ID: ${req.userId}`);
        
        // Get or create doctor profile for this user
        const doctor = await getOrCreateDoctorProfile(req.userId);
        
        if (!doctor) {
            console.error(`Doctor profile not found/created for user ${req.userId}`);
            return res.status(404).send({ 
                message: 'Doctor not found. Please contact the administrator to link your account.' 
            });
        }

        const doctorId = doctor.id;

        // Get all appointments for this doctor
        const sql = `
            SELECT a.*, 
                u.full_name as patient_name,
                u.full_name as patient_first_name, 
                u.email as patient_email,
                d.name as doctor_name, 
                d.specialty as specialization,
                s.name as service_name, 
                s.price, 
                s.duration_mins,
                a.time_slot as appointment_time
            FROM appointments a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            LEFT JOIN services s ON a.service_id = s.id
            WHERE a.doctor_id = ?
            ORDER BY a.appointment_date DESC, a.time_slot DESC
        `;
        const [appointments] = await db.query(sql, [doctorId]);
        res.status(200).send(appointments);
    } catch (err) {
        console.error('Get doctor appointments error:', err);
        res.status(500).send({ message: err.message || 'Error fetching appointments' });
    }
};

// Confirm appointment (Doctor only - for their own appointments)
exports.confirmAppointment = async (req, res) => {
    try {
        console.log(`confirmAppointment called for user ID: ${req.userId}`);
        
        // Get or create doctor profile for this user
        const doctor = await getOrCreateDoctorProfile(req.userId);
        
        if (!doctor) {
            console.error(`Doctor profile not found/created for user ${req.userId}`);
            return res.status(404).send({ 
                message: 'Doctor not found. Please contact the administrator to link your account.' 
            });
        }

        const doctorId = doctor.id;

        // Check if appointment belongs to this doctor
        const [appointments] = await db.query('SELECT * FROM appointments WHERE id = ? AND doctor_id = ?', [req.params.id, doctorId]);
        
        if (appointments.length === 0) {
            return res.status(404).send({ message: 'Appointment not found or does not belong to you.' });
        }

        // Update status to confirmed
        await db.query('UPDATE appointments SET status = ? WHERE id = ?', ['confirmed', req.params.id]);
        res.status(200).send({ message: 'Appointment confirmed successfully!' });
    } catch (err) {
        console.error('Confirm appointment error:', err);
        res.status(500).send({ message: err.message || 'Error confirming appointment' });
    }
};

// Decline appointment (Doctor only - for their own appointments)
exports.declineAppointment = async (req, res) => {
    const { decline_message } = req.body;

    if (!decline_message || !decline_message.trim()) {
        return res.status(400).send({ message: 'Decline message is required.' });
    }

    try {
        console.log(`declineAppointment called for user ID: ${req.userId}`);
        
        // Get or create doctor profile for this user
        const doctor = await getOrCreateDoctorProfile(req.userId);
        
        if (!doctor) {
            console.error(`Doctor profile not found/created for user ${req.userId}`);
            return res.status(404).send({ 
                message: 'Doctor not found. Please contact the administrator to link your account.' 
            });
        }

        const doctorId = doctor.id;

        // Check if appointment belongs to this doctor
        const [appointments] = await db.query('SELECT * FROM appointments WHERE id = ? AND doctor_id = ?', [req.params.id, doctorId]);
        
        if (appointments.length === 0) {
            return res.status(404).send({ message: 'Appointment not found or does not belong to you.' });
        }

        // Update status to declined with message
        await db.query(
            'UPDATE appointments SET status = ?, decline_message = ? WHERE id = ?',
            ['declined', decline_message, req.params.id]
        );
        res.status(200).send({ message: 'Appointment declined successfully!' });
    } catch (err) {
        console.error('Decline appointment error:', err);
        res.status(500).send({ message: err.message || 'Error declining appointment' });
    }
};

// Get logged-in doctor's profile
exports.getMyProfile = async (req, res) => {
    try {
        console.log(`=== getMyProfile START ===`);
        console.log(`User ID from request: ${req.userId}`);
        console.log(`User Role from request: ${req.userRole}`);
        
        // Get or create doctor profile for this user
        const doctor = await getOrCreateDoctorProfile(req.userId);
        
        if (!doctor) {
            console.error(`getOrCreateDoctorProfile returned null for user ${req.userId}`);
            return res.status(404).send({ 
                message: 'Doctor not found. Please contact the administrator to link your account.' 
            });
        }

        console.log(`Successfully retrieved doctor profile:`, doctor);
        console.log(`=== getMyProfile END ===`);
        res.status(200).send(doctor);
    } catch (err) {
        console.error('=== getMyProfile ERROR ===');
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        console.error('=========================');
        res.status(500).send({ message: err.message || 'Error fetching profile' });
    }
};

// Update logged-in doctor's profile
exports.updateMyProfile = async (req, res) => {
    const { name, specialty, email } = req.body;

    try {
        console.log(`updateMyProfile called for user ID: ${req.userId}`);
        
        // Get or create doctor profile for this user
        const doctor = await getOrCreateDoctorProfile(req.userId);
        
        if (!doctor) {
            console.error(`Doctor profile not found/created for user ${req.userId}`);
            return res.status(404).send({ 
                message: 'Doctor not found. Please contact the administrator to link your account.' 
            });
        }

        const doctorId = doctor.id;

        // Update doctor profile
        await Doctor.update(doctorId, { name, specialty, email });

        // Also update user table
        await db.query('UPDATE users SET full_name = ?, email = ? WHERE id = ?', [name, email, req.userId]);

        res.status(200).send({ message: 'Profile updated successfully!' });
    } catch (err) {
        console.error('Update doctor profile error:', err);
        res.status(500).send({ message: err.message || 'Error updating profile' });
    }
};

// Delete logged-in doctor's account
exports.deleteMyAccount = async (req, res) => {
    try {
        // Get doctor profile (don't auto-create for deletion)
        const doctor = await Doctor.findByUserId(req.userId);
        
        if (!doctor) {
            // Just delete the user account if no doctor profile exists
            await db.query('DELETE FROM users WHERE id = ?', [req.userId]);
            return res.status(200).send({ message: 'Account deleted successfully!' });
        }

        const doctorId = doctor.id;

        // Delete doctor profile (this will also handle appointments due to foreign key constraints or manual cleanup)
        await Doctor.delete(doctorId);

        // Delete user account
        await db.query('DELETE FROM users WHERE id = ?', [req.userId]);

        res.status(200).send({ message: 'Account deleted successfully!' });
    } catch (err) {
        console.error('Delete doctor account error:', err);
        res.status(500).send({ message: err.message || 'Error deleting account' });
    }
};

// Link doctor profile to user account (Admin only)
exports.linkDoctorToUser = async (req, res) => {
    const { doctor_id, user_id } = req.body;

    try {
        // Verify the user exists and has doctor role
        const [users] = await db.query('SELECT id, role FROM users WHERE id = ?', [user_id]);
        if (users.length === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }
        if (users[0].role !== 'doctor') {
            return res.status(400).send({ message: 'User must have doctor role.' });
        }

        // Verify the doctor profile exists
        const doctor = await Doctor.findById(doctor_id);
        if (!doctor) {
            return res.status(404).send({ message: 'Doctor profile not found.' });
        }

        // Check if user is already linked to another doctor
        const existingLink = await Doctor.findByUserId(user_id);
        if (existingLink && existingLink.id !== doctor_id) {
            return res.status(400).send({ 
                message: 'This user is already linked to another doctor profile.' 
            });
        }

        // Link the user to the doctor profile
        await Doctor.linkUser(doctor_id, user_id);

        res.status(200).send({ 
            message: 'Doctor profile successfully linked to user account!',
            doctor_id,
            user_id
        });
    } catch (err) {
        console.error('Link doctor to user error:', err);
        res.status(500).send({ message: err.message || 'Error linking doctor to user' });
    }
};

// Update doctor availability status
// Can be accessed by: Admin, Staff, or the doctor themselves
exports.updateAvailability = async (req, res) => {
    const { is_available } = req.body;
    const doctorId = req.params.id;

    try {
        console.log(`Updating availability for doctor ${doctorId} to ${is_available}`);
        
        // If the logged-in user is a doctor, verify they are updating their own profile
        if (req.userRole === 'doctor') {
            const doctor = await Doctor.findByUserId(req.userId);
            if (!doctor || doctor.id !== parseInt(doctorId)) {
                return res.status(403).send({ 
                    message: 'You can only update your own availability status.' 
                });
            }
        }

        // Verify doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).send({ message: 'Doctor not found.' });
        }

        // Update availability
        const affectedRows = await Doctor.updateAvailability(doctorId, is_available);
        
        if (affectedRows === 0) {
            return res.status(404).send({ message: 'Doctor not found or no changes made.' });
        }

        res.status(200).send({ 
            message: `Doctor availability updated to ${is_available ? 'available' : 'unavailable'}`,
            is_available 
        });
    } catch (err) {
        console.error('Update availability error:', err);
        res.status(500).send({ message: err.message || 'Error updating availability' });
    }
};

// Update logged-in doctor's availability
exports.updateMyAvailability = async (req, res) => {
    const { is_available } = req.body;

    try {
        console.log(`Doctor ${req.userId} updating their own availability to ${is_available}`);
        
        // Get or create doctor profile
        const doctor = await getOrCreateDoctorProfile(req.userId);
        const doctorId = doctor.id;

        // Update availability
        const affectedRows = await Doctor.updateAvailability(doctorId, is_available);
        
        if (affectedRows === 0) {
            return res.status(404).send({ message: 'Failed to update availability.' });
        }

        res.status(200).send({ 
            message: `Your availability has been updated to ${is_available ? 'available' : 'unavailable'}`,
            is_available 
        });
    } catch (err) {
        console.error('Update my availability error:', err);
        res.status(500).send({ message: err.message || 'Error updating availability' });
    }
};
