const db = require('../config/db.config');

class Appointment {
    // Create a new appointment
    static async create(appointmentData) {
        const sql = `INSERT INTO appointments 
      (user_id, doctor_id, service_id, appointment_date, time_slot, payment_method, status, payment_status, notes, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
        const params = [
            appointmentData.user_id,
            appointmentData.doctor_id,
            appointmentData.service_id,
            appointmentData.appointment_date,
            appointmentData.appointment_time || appointmentData.time_slot,
            appointmentData.payment_method || 'clinic',
            appointmentData.status || 'pending',
            appointmentData.payment_status || 'pending',
            appointmentData.notes || null
        ];
        const [result] = await db.query(sql, params);
        return result.insertId;
    }

    // Get all appointments with user, doctor, and service details
    static async getAll() {
        const sql = `
      SELECT a.*, 
        u.full_name as patient_name,
        u.full_name as patient_first_name, u.email as patient_email,
        d.name as doctor_name, d.specialty as specialization,
        s.name as service_name, s.price as service_price, s.duration_mins,
        a.time_slot, a.time_slot as appointment_time
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN services s ON a.service_id = s.id
      ORDER BY a.appointment_date DESC, a.time_slot DESC
    `;
        const [rows] = await db.query(sql);
        return rows;
    }

    // Get appointments by user ID
    static async getByUserId(userId) {
        const sql = `
      SELECT a.*, 
        d.name as doctor_name, d.specialty as specialization,
        s.name as service_name, s.price, s.duration_mins,
        a.time_slot as appointment_time
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.user_id = ?
      ORDER BY a.appointment_date DESC, a.time_slot DESC
    `;
        const [rows] = await db.query(sql, [userId]);
        return rows;
    }

    // Get appointment by ID
    static async findById(id) {
        const sql = `
      SELECT a.*, 
        u.full_name as patient_first_name, u.email as patient_email,
        d.name as doctor_name, d.specialty as specialization,
        s.name as service_name, s.price, s.duration_mins,
        a.time_slot as appointment_time
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
    `;
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    }

    // Get booked time slots for a specific doctor and date
    static async getBookedSlots(doctorId, date) {
        const sql = `
      SELECT time_slot 
      FROM appointments 
      WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'
    `;
        const [rows] = await db.query(sql, [doctorId, date]);
        return rows.map(row => row.time_slot);
    }

    // Update appointment status
    static async updateStatus(id, status) {
        const sql = 'UPDATE appointments SET status = ? WHERE id = ?';
        const [result] = await db.query(sql, [status, id]);
        return result.affectedRows;
    }

    // Update payment status
    static async updatePaymentStatus(id, paymentStatus, paymentReference = null) {
        const sql = 'UPDATE appointments SET payment_status = ?, payment_reference = ?, paid_at = NOW() WHERE id = ?';
        const [result] = await db.query(sql, [paymentStatus, paymentReference, id]);
        return result.affectedRows;
    }

    // Update payment reference
    static async updatePaymentReference(id, paymentReference) {
        const sql = 'UPDATE appointments SET payment_reference = ? WHERE id = ?';
        const [result] = await db.query(sql, [paymentReference, id]);
        return result.affectedRows;
    }

    // Update payment method
    static async updatePaymentMethod(id, paymentMethod) {
        const sql = 'UPDATE appointments SET payment_method = ? WHERE id = ?';
        const [result] = await db.query(sql, [paymentMethod, id]);
        return result.affectedRows;
    }

    // Delete appointment
    static async delete(id) {
        const [result] = await db.query('DELETE FROM appointments WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // Get appointments for specific month/year
    static async getByMonth(month, year) {
        const sql = `
      SELECT a.*, 
        u.full_name as patient_first_name,
        d.name as doctor_name,
        s.name as service_name,
        a.time_slot as appointment_time
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE MONTH(a.appointment_date) = ? AND YEAR(a.appointment_date) = ?
      ORDER BY a.appointment_date, a.time_slot
    `;
        const [rows] = await db.query(sql, [month, year]);
        return rows;
    }

    // Count appointments by user and date
    static async countByUserAndDate(userId, date) {
        const sql = 'SELECT COUNT(*) as count FROM appointments WHERE user_id = ? AND appointment_date = ? AND status != "cancelled"';
        const [rows] = await db.query(sql, [userId, date]);
        return rows[0].count;
    }

    // Count active appointments for a specific date (not cancelled or declined)
    static async countActiveByDate(date) {
        const sql = 'SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ? AND status NOT IN ("cancelled", "declined")';
        const [rows] = await db.query(sql, [date]);
        return rows[0].count;
    }

    // Clear appointment history for a user (delete pending, cancelled, declined)
    static async clearHistory(userId) {
        const sql = 'DELETE FROM appointments WHERE user_id = ? AND status IN ("pending", "cancelled", "declined")';
        const [result] = await db.query(sql, [userId]);
        return result.affectedRows;
    }
}

module.exports = Appointment;
