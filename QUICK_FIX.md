# 🔧 Quick Fix cho lỗi 500

## Vấn đề

- ✅ Database connection: OK (`"db": "reachable"`)
- ❌ Query endpoints: Lỗi 500

## Nguyên nhân có thể

Tables chưa được tạo trong Neon database.

## Giải pháp

### Bước 1: Kiểm tra tables đã tồn tại chưa

1. Vào Neon Dashboard → SQL Editor
2. Chạy query sau:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Nếu không thấy tables** (User, Subject, Room, Class, ...) → Cần tạo tables

**Nếu đã có tables** → Có thể schema không khớp với Prisma

### Bước 2: Tạo tables

1. Mở file `create-tables.sql`
2. Copy toàn bộ nội dung
3. Paste vào Neon SQL Editor
4. Click **Run**

### Bước 3: Restart backend

```bash
cd services/core
npm run dev
```

### Bước 4: Test lại

```bash
node test-api.js
```

## Nếu vẫn lỗi sau khi tạo tables

Có thể Prisma schema không khớp với database. Thử:

```bash
cd services/core
npx prisma db pull
```

Lệnh này sẽ sync Prisma schema với database hiện tại.

## Kiểm tra log backend

Xem log trong terminal chạy `npm run dev` để biết lỗi cụ thể khi query database.

