-- Kiểm tra tables đã tồn tại chưa
-- Chạy trong Neon SQL Editor

-- Kiểm tra enum types
SELECT typname, typtype 
FROM pg_type 
WHERE typname IN ('Role', 'RequestType', 'RequestStatus', 'ScheduleType', 'ScheduleStatus')
ORDER BY typname;

-- Kiểm tra tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Kiểm tra table User cụ thể
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'User'
ORDER BY ordinal_position;

