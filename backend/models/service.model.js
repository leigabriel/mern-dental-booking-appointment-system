const db = require('../config/db.config');

class Service {
    // Create a new service
    static async create(serviceData) {
        const sql = 'INSERT INTO services (name, price, duration_mins, created_at) VALUES (?, ?, ?, NOW())';
        const params = [
            serviceData.name,
            serviceData.price,
            serviceData.duration_mins || 30
        ];
        const [result] = await db.query(sql, params);
        return result.insertId;
    }

    // Get all services
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM services ORDER BY id ASC');
        return rows;
    }

    // Get service by ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [id]);
        return rows[0];
    }

    // Update service
    static async update(id, serviceData) {
        const sql = 'UPDATE services SET name = ?, price = ?, duration_mins = ? WHERE id = ?';
        const params = [
            serviceData.name,
            serviceData.price,
            serviceData.duration_mins,
            id
        ];
        const [result] = await db.query(sql, params);
        return result.affectedRows;
    }

    // Delete service
    static async delete(id) {
        const [result] = await db.query('DELETE FROM services WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Service;
