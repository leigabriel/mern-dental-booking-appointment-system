-- ALTER TABLE commands for database updates
-- Run these if you need to modify existing tables without dropping them

-- ==================================================
-- USERS TABLE UPDATES
-- ==================================================

-- Add missing columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified_at DATETIME DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_suspended TINYINT(1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT NULL;

-- Add indexes for better performance
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_role (role);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_email (email);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_username (username);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_google_id (google_id);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_is_suspended (is_suspended);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_verification_token (verification_token);

-- Make google_id unique
ALTER TABLE users ADD UNIQUE IF NOT EXISTS unique_google_id (google_id);

-- ==================================================
-- DOCTORS TABLE UPDATES
-- ==================================================

-- Add user_id column if it doesn't exist
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS user_id INT(11) UNSIGNED NULL AFTER id;

-- Add foreign key constraint if it doesn't exist
-- Note: This might fail if constraint already exists, that's OK
ALTER TABLE doctors 
ADD CONSTRAINT fk_doctors_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes for better performance
ALTER TABLE doctors ADD INDEX IF NOT EXISTS idx_specialty (specialty);
ALTER TABLE doctors ADD INDEX IF NOT EXISTS idx_user_id (user_id);

-- ==================================================
-- FIX EXISTING DATA (if username is wrong)
-- ==================================================

-- Update usernames to match the expected values
-- Only run these if your database has different usernames
UPDATE users SET username = 'nitchelpau' WHERE id = 2 AND username = 'nitchel';
UPDATE users SET username = 'judith' WHERE id = 3 AND username != 'judith';
UPDATE users SET username = 'mylene' WHERE id = 4 AND username != 'mylene';
UPDATE users SET username = 'joanaruth' WHERE id = 5 AND username != 'joanaruth';
UPDATE users SET username = 'cyred' WHERE id = 6 AND username != 'cyred';

-- ==================================================
-- ADD MISSING DOCTOR PROFILES
-- ==================================================

-- Insert doctor profiles for users who don't have them
-- This uses INSERT IGNORE to skip if they already exist
INSERT IGNORE INTO doctors (user_id, name, specialty, email) 
SELECT 
    u.id as user_id,
    u.full_name as name,
    'General Dentistry' as specialty,
    u.email
FROM users u
LEFT JOIN doctors d ON d.user_id = u.id
WHERE u.role = 'doctor' AND d.id IS NULL;

-- ==================================================
-- VERIFICATION QUERIES
-- ==================================================

-- Check if all doctor users have doctor profiles
SELECT 
    u.id as user_id, 
    u.username, 
    u.full_name,
    u.role,
    d.id as doctor_id, 
    d.name as doctor_name,
    d.specialty,
    CASE 
        WHEN d.id IS NULL THEN '❌ NO PROFILE'
        ELSE '✅ LINKED'
    END as status
FROM users u
LEFT JOIN doctors d ON d.user_id = u.id
WHERE u.role = 'doctor'
ORDER BY u.id;

-- ==================================================
-- NOTES
-- ==================================================
-- 1. These ALTER TABLE commands are safe to run multiple times
-- 2. IF NOT EXISTS prevents errors if column/index already exists
-- 3. INSERT IGNORE skips duplicate entries
-- 4. Foreign key constraint may fail if already exists (that's OK)
-- 5. Run the verification query at the end to check everything is linked correctly
-- ==================================================
