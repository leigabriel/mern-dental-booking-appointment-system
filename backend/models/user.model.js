const db = require('../config/db.config');

class User {
    // Create a new user
    static async create(userData) {
        const sql = 'INSERT INTO users (full_name, username, email, password, google_id, email_verified_at, role, is_suspended, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())';
        const params = [
            userData.full_name || userData.name,
            userData.username,
            userData.email,
            userData.password || null,
            userData.google_id || null,
            userData.email_verified_at || null,
            userData.role || 'user',
            userData.is_suspended || 0
        ];
        const [result] = await db.query(sql, params);
        return result.insertId;
    }

    // Find user by email
    static async findByEmail(email) {
        const [rows] = await db.query('SELECT *, full_name as name FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    // Find user by username
    static async findByUsername(username) {
        const [rows] = await db.query('SELECT *, full_name as name FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    // Find user by email or username
    static async findByEmailOrUsername(identifier) {
        const [rows] = await db.query('SELECT *, full_name as name FROM users WHERE email = ? OR username = ?', [identifier, identifier]);
        return rows[0];
    }

    // Find user by Google ID
    static async findByGoogleId(googleId) {
        const [rows] = await db.query('SELECT *, full_name as name FROM users WHERE google_id = ?', [googleId]);
        return rows[0];
    }

    // Find user by ID
    static async findById(id) {
        console.log(`[User.findById] Looking for user with ID: ${id}`);
        const [rows] = await db.query('SELECT id, full_name, full_name as name, username, email, google_id, email_verified_at, role, is_suspended, created_at FROM users WHERE id = ?', [id]);
        console.log(`[User.findById] Query returned ${rows?.length || 0} rows`);
        if (rows && rows.length > 0) {
            console.log(`[User.findById] Found user: ID=${rows[0].id}, username=${rows[0].username}, role=${rows[0].role}`);
        }
        return rows[0];
    }

    // Update user
    static async update(id, userData) {
        const sql = 'UPDATE users SET full_name = ?, username = ? WHERE id = ?';
        const params = [userData.full_name || userData.name, userData.username, id];
        const [result] = await db.query(sql, params);
        return result.affectedRows;
    }

    // Set verification token
    static async setVerificationToken(id, token) {
        const sql = 'UPDATE users SET verification_token = ? WHERE id = ?';
        const [result] = await db.query(sql, [token, id]);
        return result.affectedRows;
    }

    // Find user by verification token
    static async findByVerificationToken(token) {
        const [rows] = await db.query('SELECT * FROM users WHERE verification_token = ?', [token]);
        return rows[0];
    }

    // Update email verification
    static async verifyEmail(id) {
        const sql = 'UPDATE users SET email_verified_at = NOW(), verification_token = NULL WHERE id = ?';
        const [result] = await db.query(sql, [id]);
        return result.affectedRows;
    }

    // Get all users with specific role
    static async getAllByRole(role) {
        const [rows] = await db.query('SELECT id, full_name as name, username, email, role, is_suspended, created_at FROM users WHERE role = ?', [role]);
        return rows;
    }

    // Delete user
    static async delete(id) {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = User;
