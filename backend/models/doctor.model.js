const db = require('../config/db.config');

class Doctor {
    // Create a new doctor
    static async create(doctorData) {
        const sql = 'INSERT INTO doctors (user_id, name, specialty, email, created_at) VALUES (?, ?, ?, ?, NOW())';
        const params = [
            doctorData.user_id || null,
            doctorData.name,
            doctorData.specialty || doctorData.specialization,
            doctorData.email
        ];
        const [result] = await db.query(sql, params);
        return result.insertId;
    }

    // Get all doctors
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM doctors ORDER BY name');
        return rows;
    }

    // Get all doctors with linked user accounts
    static async getAllWithUsers() {
        const sql = `
            SELECT 
                d.id,
                d.user_id,
                d.name,
                d.specialty,
                d.email,
                d.created_at,
                u.username,
                u.email_verified_at
            FROM doctors d
            LEFT JOIN users u ON d.user_id = u.id
            ORDER BY d.name
        `;
        const [rows] = await db.query(sql);
        return rows;
    }

    // Link user account to doctor
    static async linkUser(doctorId, userId) {
        const sql = 'UPDATE doctors SET user_id = ? WHERE id = ?';
        const [result] = await db.query(sql, [userId, doctorId]);
        return result.affectedRows;
    }

    // Get doctor by ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM doctors WHERE id = ?', [id]);
        return rows[0];
    }

    // Get doctor by user_id
    static async findByUserId(userId) {
        console.log(`[Doctor.findByUserId] Looking for doctor with user_id: ${userId}`);
        const [rows] = await db.query('SELECT * FROM doctors WHERE user_id = ?', [userId]);
        console.log(`[Doctor.findByUserId] Query returned ${rows?.length || 0} rows`);
        if (rows && rows.length > 0) {
            console.log(`[Doctor.findByUserId] Found doctor:`, rows[0]);
        }
        return rows[0];
    }

    // Update doctor
    static async update(id, doctorData) {
        const sql = 'UPDATE doctors SET name = ?, specialty = ?, email = ? WHERE id = ?';
        const params = [
            doctorData.name,
            doctorData.specialty || doctorData.specialization,
            doctorData.email,
            id
        ];
        const [result] = await db.query(sql, params);
        return result.affectedRows;
    }

    // Delete doctor
    static async delete(id) {
        const [result] = await db.query('DELETE FROM doctors WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Doctor;
