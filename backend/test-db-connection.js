/**
 * Quick Database Connection Test
 * 
 * Run this to verify database connection and data:
 * node backend/test-db-connection.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
    console.log('\n========================================');
    console.log('Testing Database Connection');
    console.log('========================================\n');
    
    try {
        // Create connection
        console.log('Connecting to database...');
        console.log(`Host: ${process.env.DB_HOST}`);
        console.log(`User: ${process.env.DB_USER}`);
        console.log(`Database: ${process.env.DB_NAME}\n`);
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('✅ Connected to database!\n');
        
        // Test 1: Check if users table exists and has data
        console.log('Test 1: Checking users table...');
        const [users] = await connection.query('SELECT id, username, role FROM users WHERE role = "doctor"');
        console.log(`Found ${users.length} doctor users:`);
        users.forEach(u => console.log(`  - ID: ${u.id}, Username: ${u.username}, Role: ${u.role}`));
        
        // Test 2: Check if doctors table exists and has data
        console.log('\nTest 2: Checking doctors table...');
        const [doctors] = await connection.query('SELECT id, user_id, name, specialty FROM doctors');
        console.log(`Found ${doctors.length} doctor profiles:`);
        doctors.forEach(d => console.log(`  - Doctor ID: ${d.id}, User ID: ${d.user_id}, Name: ${d.name}, Specialty: ${d.specialty}`));
        
        // Test 3: Check the join between users and doctors
        console.log('\nTest 3: Checking user-doctor linkage...');
        const [linked] = await connection.query(`
            SELECT u.id as user_id, u.username, u.role, d.id as doctor_id, d.name as doctor_name
            FROM users u
            LEFT JOIN doctors d ON d.user_id = u.id
            WHERE u.role = 'doctor'
        `);
        console.log(`Found ${linked.length} linked doctor accounts:`);
        linked.forEach(l => {
            if (l.doctor_id) {
                console.log(`  ✅ User ${l.user_id} (${l.username}) → Doctor ${l.doctor_id} (${l.doctor_name})`);
            } else {
                console.log(`  ❌ User ${l.user_id} (${l.username}) → NO DOCTOR PROFILE`);
            }
        });
        
        // Test 4: Simulate the exact query used by the app
        console.log('\nTest 4: Simulating app query for user ID 2...');
        const [userResult] = await connection.query(
            'SELECT id, full_name, full_name as name, username, email, role FROM users WHERE id = ?',
            [2]
        );
        console.log(`User query result:`, userResult[0] || 'NOT FOUND');
        
        const [doctorResult] = await connection.query(
            'SELECT * FROM doctors WHERE user_id = ?',
            [2]
        );
        console.log(`Doctor query result:`, doctorResult[0] || 'NOT FOUND');
        
        await connection.end();
        
        console.log('\n========================================');
        console.log('✅ All database tests completed!');
        console.log('========================================\n');
        
        // Summary
        if (users.length === 0) {
            console.log('⚠️  WARNING: No doctor users found! Run database.sql to populate data.');
        } else if (doctors.length === 0) {
            console.log('⚠️  WARNING: No doctor profiles found! Run database.sql to populate data.');
        } else if (linked.some(l => !l.doctor_id)) {
            console.log('⚠️  WARNING: Some doctors are not linked to profiles!');
        } else {
            console.log('✅ Database is properly configured and populated.');
        }
        
    } catch (error) {
        console.error('\n❌ Database Test Failed!');
        console.error('Error:', error.message);
        console.error('\nPossible causes:');
        console.error('1. MySQL/MariaDB is not running');
        console.error('2. Database "dental_db" does not exist');
        console.error('3. Wrong credentials in .env file');
        console.error('4. Database not seeded with data\n');
    }
    
    process.exit(0);
}

testDatabaseConnection();
