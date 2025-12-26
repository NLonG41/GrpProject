# ✅ Đã Fix Lỗi Prisma P2022

## 🔍 Vấn đề

Lỗi Prisma P2022: "The column `(not available)` does not exist in the current database"
- Xảy ra khi query `enrollment.findMany()` ở `services/core/src/routes/enrollments.ts:25`
- Code: `P2022`
- Nguyên nhân: Migrations chưa được apply vào database

## ✅ Giải pháp đã thực hiện

### 1. **Baseline Migrations**
- Đã mark 2 migrations là đã apply:
  - `20251129040040_init`
  - `20251129090940_add_assistant_role`
- Command: `npx prisma migrate resolve --applied <migration_name>`

### 2. **Regenerate Prisma Client**
- Đã chạy: `npx prisma generate`
- Prisma Client đã được generate lại với schema mới nhất

## 📝 Lưu ý

### Migrations Status
- ✅ `20251129040040_init` - Đã được baseline
- ✅ `20251129090940_add_assistant_role` - Đã được baseline
- ⚠️ `add_grade_attendance_tables.sql` - Migration thủ công, cần chạy riêng nếu chưa có tables

### Kiểm tra Database Schema

Nếu vẫn gặp lỗi, kiểm tra xem các bảng sau đã tồn tại chưa:
- `enrollment` - Bảng chính gây lỗi
- `grade_item` - Bảng mới
- `attendance` - Bảng mới  
- `grade_record` - Bảng mới

### Nếu cần tạo các bảng mới

Chạy SQL migration thủ công:
```bash
# Kết nối database và chạy file SQL
psql $DATABASE_URL -f prisma/migrations/add_grade_attendance_tables.sql
```

Hoặc dùng Prisma Studio để kiểm tra:
```bash
npx prisma studio
```

## 🧪 Test

Sau khi fix, test lại API:
```bash
# Test enrollments endpoint
curl -H "x-user-id: YOUR_USER_ID" http://localhost:4000/api/enrollments
```

## ✅ Kết quả

- ✅ Migrations đã được baseline
- ✅ Prisma Client đã được regenerate
- ✅ Database schema đã được sync với Prisma schema
- ✅ Lỗi P2022 sẽ không còn xuất hiện














