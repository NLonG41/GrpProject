# 📝 Hướng dẫn chạy SQL Script

## Cách 1: Chạy trong Neon Database SQL Editor (KHUYẾN NGHỊ)

1. Vào Neon Dashboard: https://console.neon.tech/
2. Chọn project của bạn
3. Click **SQL Editor** (menu bên trái)
4. Mở file `create-tables.sql`
5. Copy toàn bộ nội dung
6. Paste vào SQL Editor
7. Click **Run** hoặc nhấn `Ctrl+Enter`

## Cách 2: Chạy bằng psql (nếu có)

```bash
psql "postgresql://neondb_owner:npg_f9RsDuCeHqZ7@ep-calm-water-a1d2bcmu-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" -f create-tables.sql
```

## Cách 3: Chạy từng phần (nếu gặp lỗi)

Nếu gặp lỗi khi chạy toàn bộ, có thể chạy từng phần:

1. **Tạo Enum Types trước:**
   ```sql
   CREATE TYPE "Role" AS ENUM ('ADMIN', 'ASSISTANT', 'LECTURER', 'STUDENT');
   CREATE TYPE "RequestType" AS ENUM ('REQ_LEAVE', 'REQ_MAKEUP');
   CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
   CREATE TYPE "ScheduleType" AS ENUM ('MAIN', 'MAKEUP', 'EXAM');
   CREATE TYPE "ScheduleStatus" AS ENUM ('ACTIVE', 'CANCELLED');
   ```

2. **Sau đó tạo tables** (copy từ file `create-tables.sql`)

## Sau khi chạy SQL

1. **Restart backend:**
   ```bash
   cd services/core
   npm run dev
   ```

2. **Test API:**
   ```bash
   node test-api.js
   ```

3. **Seed users (nếu cần):**
   ```bash
   cd services/core
   npm run seed:users
   ```

## Kiểm tra tables đã tạo

Trong Neon SQL Editor, chạy:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Bạn sẽ thấy các tables:
- User
- Subject
- SubjectPrerequisite
- Room
- Class
- Enrollment
- ClassSchedule
- Notification
- Request

## Nếu gặp lỗi "type already exists"

Nếu enum types đã tồn tại, bỏ qua phần tạo enum và chỉ tạo tables.

## Nếu gặp lỗi "table already exists"

Nếu tables đã tồn tại, bạn có thể:
1. Xóa tables cũ: `DROP TABLE IF EXISTS "User" CASCADE;` (lưu ý: sẽ mất data!)
2. Hoặc giữ nguyên và sync Prisma schema: `npx prisma db pull`

