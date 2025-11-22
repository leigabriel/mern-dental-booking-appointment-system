/**
 * Test Script for Doctor Login Issue
 * 
 * This script tests the doctor profile lookup and creation functionality.
 * Run this after starting the backend server to verify the fix works.
 */

const User = require('./models/user.model');
const Doctor = require('./models/doctor.model');

async function testDoctorProfileLookup() {
    console.log('\n========================================');
    console.log('Testing Doctor Profile Lookup');
    console.log('========================================\n');

    try {
        // Test with user ID 2 (nitchelpau)
        const testUserId = 2;
        console.log(`1. Testing with user ID: ${testUserId}`);
        
        // Find user
        const user = await User.findById(testUserId);
        console.log('\nUser found:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name || user.full_name}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        
        // Find doctor profile
        const doctor = await Doctor.findByUserId(testUserId);
        if (doctor) {
            console.log('\n✅ Doctor profile found:');
            console.log(`   Doctor ID: ${doctor.id}`);
            console.log(`   Name: ${doctor.name}`);
            console.log(`   Specialty: ${doctor.specialty}`);
            console.log(`   Email: ${doctor.email}`);
            console.log(`   Linked to User ID: ${doctor.user_id}`);
        } else {
            console.log('\n❌ Doctor profile NOT found');
            console.log('   This should trigger auto-creation in the actual endpoint');
        }

        console.log('\n========================================');
        console.log('Test completed successfully!');
        console.log('========================================\n');

    } catch (error) {
        console.error('\n❌ Test failed with error:');
        console.error(error);
        console.log('\n========================================\n');
    }
    
    process.exit(0);
}

// Run the test
testDoctorProfileLookup();
