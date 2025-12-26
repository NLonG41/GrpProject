# Fix Schedule API 500 Error

## Vấn đề
API `/api/schedules?status=ACTIVE` trả về lỗi 500 Internal Server Error.

## Nguyên nhân
Khi query với `status` hoặc `type` parameter, Prisma có thể gặp vấn đề với enum validation.

## Giải pháp đã áp dụng

### 1. Sửa logic khóa phòng
- **Trước:** Khóa phòng khi `endTime > now` (khóa trước khi class bắt đầu)
- **Sau:** Chỉ khóa phòng khi `startTime <= now <= endTime` (chỉ khóa trong lúc diễn ra class)

### 2. Sửa validation enum trong schedule route
- Thêm validation rõ ràng cho `status` và `type` parameters
- Sử dụng enum objects từ Prisma để validate
- Thêm error logging chi tiết hơn

### 3. Tạo file test
- File `test-schedules-api.cjs` để test các API endpoints
- Test các trường hợp: all schedules, active schedules, cancelled schedules, invalid status, type filter, room availability

## Cần làm tiếp

### 1. Restart server
Sau khi sửa code, cần restart backend server:
```bash
cd services/core
npm run dev
```

### 2. Kiểm tra log server
Khi chạy test, xem log server để biết lỗi cụ thể:
```bash
node test-schedules-api.cjs
```

### 3. Kiểm tra database
Đảm bảo:
- Table `class_schedule` tồn tại
- Column `status` có type `ScheduleStatus` enum
- Column `type` có type `ScheduleType` enum
- Có dữ liệu test trong database

### 4. Migration SQL (nếu cần)
Nếu database chưa có enum types, có thể cần chạy migration:

```sql
-- Kiểm tra xem enum đã tồn tại chưa
SELECT typname FROM pg_type WHERE typname IN ('ScheduleStatus', 'ScheduleType');

-- Nếu chưa có, Prisma sẽ tự tạo khi chạy migration
-- Hoặc có thể tạo thủ công:
CREATE TYPE "ScheduleStatus" AS ENUM ('ACTIVE', 'CANCELLED');
CREATE TYPE "ScheduleType" AS ENUM ('MAIN', 'MAKEUP', 'EXAM');
```

## Files đã thay đổi

1. `services/core/src/routes/schedule.ts`
   - Sửa validation cho status và type parameters
   - Thêm error logging chi tiết

2. `portal-ui-react/src/features/assistant/components/SchedulingBoard.tsx`
   - Sửa logic khóa phòng: chỉ khóa khi đang trong thời gian diễn ra class
   - Hiển thị badge "Đã khóa phòng" chỉ khi class đang diễn ra

3. `test-schedules-api.cjs`
   - File test mới để kiểm tra API endpoints

## Test

Chạy test:
```bash
node test-schedules-api.cjs
```

Kết quả mong đợi:
- ✅ Test 1: GET /api/schedules - Success
- ✅ Test 2: GET /api/schedules?status=ACTIVE - Success (sau khi fix)
- ✅ Test 3: GET /api/schedules?status=CANCELLED - Success (sau khi fix)
- ✅ Test 5: GET /api/schedules?type=MAIN - Success (sau khi fix)








