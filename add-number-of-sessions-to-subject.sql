-- Migration: Thêm field numberOfSessions vào bảng subject
-- Chạy trong Neon SQL Editor: https://console.neon.tech

-- Thêm column numberOfSessions vào bảng subject
ALTER TABLE subject 
ADD COLUMN IF NOT EXISTS "numberOfSessions" INTEGER;

-- Comment cho column
COMMENT ON COLUMN subject."numberOfSessions" IS 'Số buổi học cho môn học (học phần)';

-- Verify
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'subject' 
  AND column_name = 'numberOfSessions';








