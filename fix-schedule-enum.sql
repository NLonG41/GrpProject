-- Script để fix enum types cho ScheduleStatus và ScheduleType
-- Chạy trong Neon SQL Editor: https://console.neon.tech
-- ⚠️ BACKUP DATABASE TRƯỚC KHI CHẠY!

-- Bước 1: Tạo enum types nếu chưa có
DO $$ 
BEGIN
    -- Tạo ScheduleType enum nếu chưa có
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ScheduleType') THEN
        CREATE TYPE "ScheduleType" AS ENUM ('MAIN', 'MAKEUP', 'EXAM');
    END IF;
    
    -- Tạo ScheduleStatus enum nếu chưa có
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ScheduleStatus') THEN
        CREATE TYPE "ScheduleStatus" AS ENUM ('ACTIVE', 'CANCELLED');
    END IF;
END $$;

-- Bước 2: Kiểm tra column types hiện tại
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_name = 'class_schedule' 
  AND column_name IN ('status', 'type');

-- Bước 3: Nếu columns đang là varchar, cần convert sang enum
-- ⚠️ CHỈ CHẠY NẾU COLUMNS ĐANG LÀ VARCHAR!

-- Bước 3.1: Drop default constraints trước
ALTER TABLE class_schedule 
ALTER COLUMN type DROP DEFAULT;

ALTER TABLE class_schedule 
ALTER COLUMN status DROP DEFAULT;

-- Bước 3.2: Convert type column từ varchar sang enum
ALTER TABLE class_schedule 
ALTER COLUMN type TYPE "ScheduleType" 
USING type::"ScheduleType";

-- Bước 3.3: Convert status column từ varchar sang enum
ALTER TABLE class_schedule 
ALTER COLUMN status TYPE "ScheduleStatus" 
USING status::"ScheduleStatus";

-- Bước 3.4: Set default values lại với enum values
ALTER TABLE class_schedule 
ALTER COLUMN type SET DEFAULT 'MAIN'::"ScheduleType";

ALTER TABLE class_schedule 
ALTER COLUMN status SET DEFAULT 'ACTIVE'::"ScheduleStatus";

-- Bước 4: Verify sau khi convert
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_name = 'class_schedule' 
  AND column_name IN ('status', 'type');

