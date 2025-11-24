-- Add availability status column to doctors table
-- This allows admin, staff, and doctors to set availability status

USE dental_db;

-- Add is_available column with default value 1 (available)
ALTER TABLE doctors 
ADD COLUMN is_available TINYINT(1) NOT NULL DEFAULT 1 
COMMENT 'Doctor availability status: 1=available, 0=unavailable';

-- Create index for faster queries
CREATE INDEX idx_is_available ON doctors(is_available);
