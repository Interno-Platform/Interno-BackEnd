-- Add rejection reason field to companies table
ALTER TABLE companies 
ADD COLUMN rejection_reason VARCHAR(1000) NULL COMMENT 'Reason for rejection by admin';

-- Add rejection reason field to internships table
ALTER TABLE internships 
ADD COLUMN rejection_reason VARCHAR(1000) NULL COMMENT 'Reason for rejection by admin';
