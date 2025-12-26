-- Script để check ScheduleStatus và ScheduleType trong database
-- Chạy trong Neon SQL Editor: https://console.neon.tech

-- 1. Kiểm tra enum types có tồn tại không
SELECT typname, typtype 
FROM pg_type 
WHERE typname IN ('ScheduleStatus', 'ScheduleType');

-- 2. Kiểm tra table class_schedule và column types
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_name = 'class_schedule' 
  AND column_name IN ('status', 'type');

-- 3. Xem dữ liệu hiện tại trong class_schedule
SELECT 
    id,
    "classId",
    "roomId",
    "startTime",
    "endTime",
    type,
    status,
    "createdAt"
FROM class_schedule
LIMIT 10;

-- 4. Kiểm tra xem có enum values nào không
SELECT DISTINCT status FROM class_schedule;
SELECT DISTINCT type FROM class_schedule;








