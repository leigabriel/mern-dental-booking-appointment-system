const Appointment = require('../models/appointment.model');

// Create new appointment
exports.createAppointment = async (req, res) => {
    const { doctor_id, service_id, appointment_date, appointment_time, payment_method, notes } = req.body;

    try {
        // Check if user already has 5 appointments on this date
        const appointmentCount = await Appointment.countByUserAndDate(req.userId, appointment_date);
        if (appointmentCount >= 5) {
            return res.status(400).send({
                message: 'You have reached the maximum limit of 5 appointments per day.'
            });
        }

        // Check daily booking cap (max 5 active bookings per day across all users)
        const activeCount = await Appointment.countActiveByDate(appointment_date);
        if (activeCount >= 5) {
            return res.status(400).send({
                message: 'This date has reached the daily booking limit (5 appointments). Please select another date.'
            });
        }

        // Check if the time slot is already booked
        const bookedSlots = await Appointment.getBookedSlots(doctor_id, appointment_date);
        if (bookedSlots.includes(appointment_time)) {
            return res.status(400).send({
                message: 'This time slot is already booked. Please select another time.'
            });
        }

        // Determine payment status based on payment method
        let paymentStatus = 'pending';
        if (payment_method === 'clinic') {
            paymentStatus = 'unpaid';
        }

        const appointmentId = await Appointment.create({
            user_id: req.userId,
            doctor_id,
            service_id,
            appointment_date,
            appointment_time,
            payment_method: payment_method || 'clinic',
            payment_status: paymentStatus,
            status: 'pending',
            notes
        });

        res.status(201).send({
            message: 'Appointment booked successfully!',
            appointmentId
        });
    } catch (err) {
        // Handle duplicate booking error from database constraint
        if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
            return res.status(400).send({
                message: 'This time slot is already booked. Please refresh and select another time.'
            });
        }
        console.error('Appointment creation error:', err);
        res.status(500).send({ message: err.message || 'Error creating appointment' });
    }
};

// Get user's appointments
exports.getUserAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.getByUserId(req.userId);
        res.status(200).send(appointments);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get all appointments (Admin/Staff only)
exports.getAllAppointments = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        // If date filters provided, use them
        if (start_date && end_date) {
            const db = require('../config/db.config');
            const sql = `
                SELECT a.*, 
                    u.full_name as patient_name,
                    u.full_name as patient_first_name, u.email as patient_email,
                    d.id as doctor_id,
                    d.name as doctor_name, 
                    d.specialty as specialization,
                    d.specialty as doctor_specialty,
                    CONCAT(d.name) as doctor_first_name,
                    '' as doctor_last_name,
                    s.id as service_id,
                    s.name as service_name, 
                    s.price as service_price, 
                    s.duration_mins,
                    a.time_slot, a.time_slot as appointment_time
                FROM appointments a
                LEFT JOIN users u ON a.user_id = u.id
                LEFT JOIN doctors d ON a.doctor_id = d.id
                LEFT JOIN services s ON a.service_id = s.id
                WHERE a.appointment_date BETWEEN ? AND ?
                ORDER BY a.appointment_date DESC, a.time_slot DESC
            `;
            const [rows] = await db.query(sql, [start_date, end_date]);
            return res.status(200).send(rows);
        }
        
        // Otherwise, get all appointments
        const appointments = await Appointment.getAll();
        res.status(200).send(appointments);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }

        // Users can only view their own appointments
        if (req.userRole === 'user' && appointment.user_id !== req.userId) {
            return res.status(403).send({ message: 'Access denied.' });
        }

        res.status(200).send(appointment);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get booked time slots for a doctor on a specific date
exports.getBookedSlots = async (req, res) => {
    const { doctor_id, date } = req.query;

    try {
        const bookedSlots = await Appointment.getBookedSlots(doctor_id, date);
        res.status(200).send({ bookedSlots });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Update appointment status (Admin/Staff only)
exports.updateAppointmentStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const affectedRows = await Appointment.updateStatus(req.params.id, status);
        if (affectedRows === 0) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }
        res.status(200).send({ message: 'Appointment status updated successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Cancel appointment (User can cancel their own, Admin/Staff can cancel any)
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }

        // Check if user has permission to cancel
        if (req.userRole === 'user' && appointment.user_id !== req.userId) {
            return res.status(403).send({ message: 'Access denied.' });
        }

        await Appointment.updateStatus(req.params.id, 'cancelled');
        res.status(200).send({ message: 'Appointment cancelled successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Confirm appointment (Admin/Staff only)
exports.confirmAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }

        await Appointment.updateStatus(req.params.id, 'confirmed');
        res.status(200).send({ message: 'Appointment confirmed successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Decline appointment with message (Admin/Staff/Doctor)
exports.declineAppointment = async (req, res) => {
    const { decline_message } = req.body;

    if (!decline_message || !decline_message.trim()) {
        return res.status(400).send({ message: 'Decline message is required.' });
    }

    try {
        const db = require('../config/db.config');
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }

        // Try to annotate the decline message with the actor (admin/staff/doctor) who performed the action.
        let annotatedMessage = decline_message;
        try {
            const User = require('../models/user.model');
            const actor = await User.findById(req.userId);
            const roleLabel = req.userRole ? req.userRole.charAt(0).toUpperCase() + req.userRole.slice(1) : 'Staff';
            const actorName = actor ? (actor.full_name || actor.name || actor.username) : null;
            if (actorName) {
                annotatedMessage = `${roleLabel} ${actorName}: ${decline_message}`;
            } else {
                annotatedMessage = `${roleLabel}: ${decline_message}`;
            }
        } catch (innerErr) {
            // If user lookup fails, fallback to role-only annotation
            const roleLabel = req.userRole ? req.userRole.charAt(0).toUpperCase() + req.userRole.slice(1) : 'Staff';
            annotatedMessage = `${roleLabel}: ${decline_message}`;
        }

        // Update status to declined and save the annotated decline message
        await db.query(
            'UPDATE appointments SET status = ?, decline_message = ? WHERE id = ?',
            ['declined', annotatedMessage, req.params.id]
        );

        res.status(200).send({ message: 'Appointment declined successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Mark payment as paid (Admin/Staff only)
exports.markAsPaid = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }

        await Appointment.updatePaymentStatus(req.params.id, 'paid', null);
        res.status(200).send({ message: 'Payment marked as paid successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Update payment status (Admin/Staff only)
exports.updatePaymentStatus = async (req, res) => {
    const { payment_status, payment_reference } = req.body;

    try {
        const affectedRows = await Appointment.updatePaymentStatus(
            req.params.id,
            payment_status,
            payment_reference
        );

        if (affectedRows === 0) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }

        res.status(200).send({ message: 'Payment status updated successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Refund payment (Admin/Staff only) - best-effort: call provider refund in future
exports.refundPayment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }

        if (appointment.payment_status !== 'paid') {
            return res.status(400).send({ message: 'Only paid payments can be refunded.' });
        }

        // For now, perform a server-side marking of refunded.
        // In production, call the payment provider (PayPal / PayMongo) to process a refund.
        await Appointment.updatePaymentStatus(req.params.id, 'refunded', `refund-${req.params.id}`);

        res.status(200).send({ message: 'Payment marked as refunded (server-side).' });
    } catch (err) {
        console.error('Refund payment error:', err);
        res.status(500).send({ message: err.message });
    }
};

// Get appointments by month (Admin/Staff only)
exports.getAppointmentsByMonth = async (req, res) => {
    const { month, year } = req.query;

    try {
        const appointments = await Appointment.getByMonth(month, year);
        res.status(200).send(appointments);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get appointments in JSON format for calendar (Admin/Staff only)
exports.getAppointmentsJson = async (req, res) => {
    const { month, year } = req.query;

    try {
        const appointments = await Appointment.getByMonth(month, year);
        
        // Format appointments for calendar display
        const formattedAppointments = appointments.map(apt => {
            // Format the date to YYYY-MM-DD
            let formattedDate = apt.appointment_date;
            if (apt.appointment_date instanceof Date) {
                const d = apt.appointment_date;
                formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            } else if (typeof apt.appointment_date === 'string') {
                // If it's already a string, extract just the date part (YYYY-MM-DD)
                formattedDate = apt.appointment_date.split('T')[0];
            }
            
            return {
                id: apt.id,
                date: formattedDate,
                time: apt.appointment_time || apt.time_slot,
                user: apt.patient_first_name,
                doctor: apt.doctor_name,
                service: apt.service_name,
                status: apt.status,
                payment_status: apt.payment_status
            };
        });

        res.status(200).send({
            events: formattedAppointments,
            month: parseInt(month),
            year: parseInt(year)
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Clear appointment history (User only - deletes pending, cancelled, declined)
exports.clearHistory = async (req, res) => {
    try {
        const affectedRows = await Appointment.clearHistory(req.userId);
        res.status(200).send({ 
            message: `Successfully cleared ${affectedRows} appointment(s) from history.`,
            deleted: affectedRows
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Delete appointment (Admin only)
exports.deleteAppointment = async (req, res) => {
    try {
        const affectedRows = await Appointment.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }
        res.status(200).send({ message: 'Appointment deleted successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
