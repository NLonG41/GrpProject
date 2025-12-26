# 🗄️ Hướng dẫn Setup Supabase Database

## ✅ Kết quả test

- ✅ Supabase API connection: **OK**
- ✅ Đã đọc được schema.sql
- ❌ Direct PostgreSQL connection: **Timeout** (có thể bị block)

## 🔧 Giải pháp: Dùng Connection Pooling

Supabase thường block direct connection (port 5432). Nên dùng **Connection Pooling** (port 6543).

### Bước 1: Cập nhật DATABASE_URL trong `.env`

Mở file `services/core/.env` và thay đổi:

**❌ CŨ (Direct connection - bị timeout):**
```env
DATABASE_URL=postgresql://postgres:FfoBmn5FJm4irTxE@db.ullrhadkkparypdvrqvi.supabase.co:5432/postgres
```

**✅ MỚI (Connection pooling - KHUYẾN NGHỊ):**
```env
DATABASE_URL=postgresql://postgres.ullrhadkkparypdvrqvi:FfoBmn5FJm4irTxE@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Lưu ý:**
- Thay `ap-southeast-1` bằng region của bạn (xem trong Supabase Dashboard → Settings → Database)
- Port `6543` là connection pooling (không bị block)
- Format: `postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### Bước 2: Chạy Prisma Migrations

```bash
cd services/core
npx prisma migrate deploy
```

Hoặc nếu muốn tạo migration mới:

```bash
npx prisma migrate dev --name init_supabase
```

### Bước 3: Test lại

```bash
npm run dev
```

Kiểm tra log - không còn lỗi "SocketTimeout" hoặc "db: unreachable".

## 🔍 Nếu vẫn lỗi

### Kiểm tra Region

1. Vào Supabase Dashboard: https://supabase.com/dashboard/project/ullrhadkkparypdvrqvi
2. Settings → Database
3. Xem **Connection string** → **Connection pooling**
4. Copy đúng connection string từ đó

### Kiểm tra Password

1. Settings → Database
2. Xem **Database password**
3. Nếu quên, click **Reset database password**
4. Cập nhật password mới vào `.env`

### Tạo Schema thủ công (nếu Prisma migrate không được)

1. Vào Supabase Dashboard → **SQL Editor**
2. Chạy lệnh sau để tạo enum types:

```sql
-- Tạo enum types
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ASSISTANT', 'LECTURER', 'STUDENT');
CREATE TYPE "RequestType" AS ENUM ('REQ_LEAVE', 'REQ_MAKEUP');
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "ScheduleType" AS ENUM ('MAIN', 'MAKEUP', 'EXAM');
CREATE TYPE "ScheduleStatus" AS ENUM ('ACTIVE', 'CANCELLED');
```

3. Sau đó chạy Prisma migrations:

```bash
cd services/core
npx prisma migrate deploy
```

## 📋 Connection Strings để thử

Nếu connection pooling không hoạt động, thử các format sau:

### 1. Connection Pooling (port 6543) - KHUYẾN NGHỊ
```
postgresql://postgres.ullrhadkkparypdvrqvi:FfoBmn5FJm4irTxE@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### 2. Connection Pooling (port 5432)
```
postgresql://postgres.ullrhadkkparypdvrqvi:FfoBmn5FJm4irTxE@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### 3. Direct Connection (port 5432) - Có thể bị block
```
postgresql://postgres:FfoBmn5FJm4irTxE@db.ullrhadkkparypdvrqvi.supabase.co:5432/postgres
```

## ✅ Sau khi setup xong

1. Test API: `node test-api.js`
2. Seed users: `npm run seed:users` (trong `services/core`)
3. Kiểm tra database trong Supabase Dashboard → Table Editor




