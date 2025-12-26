# 🔧 Troubleshooting Guide

Hướng dẫn xử lý các vấn đề thường gặp với Neon Database architecture.

## ❌ Vấn Đề Thường Gặp

### 1. Core Service không kết nối được Neon Database

**Triệu chứng:**
```json
{
  "status": "ok",
  "db": "unreachable"
}
```

**Giải pháp:**

1. **Kiểm tra connection string trong `.env`:**
   ```bash
   cd services/core
   cat .env | grep DATABASE_URL
   ```

2. **Đảm bảo connection string đúng format:**
   ```env
   DATABASE_URL=postgresql://neondb_owner:password@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
   - Phải có `sslmode=require`
   - Phải có `channel_binding=require`
   - Password không có ký tự đặc biệt cần encode

3. **Test connection:**
   ```bash
   node test-supabase-connection.js
   # Hoặc
   curl http://localhost:4000/health
   ```

4. **Kiểm tra Neon Dashboard:**
   - Vào https://console.neon.tech/
   - Kiểm tra project có đang active không
   - Kiểm tra connection string có đúng không

5. **Restart service sau khi sửa `.env`:**
   ```bash
   # Dừng service (Ctrl+C)
   # Chạy lại
   cd services/core
   npm run dev
   ```

### 2. Port đã được sử dụng

**Triệu chứng:**
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Giải pháp:**

**Windows:**
```powershell
# Tìm process đang dùng port 4000
netstat -ano | findstr :4000
# Kill process (thay PID bằng process ID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Tìm process
lsof -i :4000
# Kill process
kill -9 <PID>
```

**Hoặc thay đổi port trong `.env`:**
```env
PORT=4001
```

### 3. Firebase Authentication Failed

**Triệu chứng:**
```
[firebase] Failed to initialize Firebase Admin: FirebaseAppError: Failed to parse private key
```

**Giải pháp:**

1. **Kiểm tra file `.env`:**
   ```bash
   cd services/core
   cat .env | grep FIREBASE_PRIVATE_KEY
   ```

2. **Đảm bảo format đúng:**
   ```env
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
   ```
   - Phải có dấu ngoặc kép `"`
   - Phải có `\n` giữa các dòng
   - Không có khoảng trắng thừa
   - Toàn bộ key phải trên một dòng

3. **Kiểm tra các biến khác:**
   ```env
   FIREBASE_PROJECT_ID=web-portal-us
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@web-portal-us.iam.gserviceaccount.com
   ```

4. **Test Firebase config:**
   ```bash
   node check-env.js
   ```

5. **Restart service:**
   ```bash
   # Dừng và chạy lại
   cd services/core
   npm run dev
   ```

### 4. Database Schema không tồn tại

**Triệu chứng:**
```
Error: relation "User" does not exist
```

**Giải pháp:**

1. **Chạy SQL script trong Neon SQL Editor:**
   - Vào Neon Dashboard → SQL Editor
   - Mở file `create-tables.sql`
   - Copy toàn bộ nội dung
   - Paste vào SQL Editor và click **Run**

2. **Hoặc chạy Prisma migrations:**
   ```bash
   cd services/core
   npx prisma migrate deploy
   ```

3. **Kiểm tra tables đã được tạo:**
   - Vào Neon Dashboard → SQL Editor
   - Chạy query:
     ```sql
     SELECT table_name FROM information_schema.tables 
     WHERE table_schema = 'public';
     ```

### 5. API trả về 500 Error

**Triệu chứng:**
```json
{
  "status": "error",
  "db": "unreachable"
}
```

**Giải pháp:**

1. **Kiểm tra health endpoint:**
   ```bash
   curl http://localhost:4000/health
   ```

2. **Kiểm tra logs trong terminal:**
   - Xem terminal nơi chạy `npm run dev`
   - Tìm lỗi cụ thể

3. **Kiểm tra database connection:**
   - Test connection: `node test-supabase-connection.js`
   - Kiểm tra Neon Dashboard

4. **Kiểm tra schema:**
   - Đảm bảo đã chạy `create-tables.sql`
   - Kiểm tra tables trong Neon Dashboard

### 6. Frontend không kết nối được Backend

**Triệu chứng:**
```
Failed to fetch
Network error
```

**Giải pháp:**

1. **Kiểm tra backend đang chạy:**
   ```bash
   curl http://localhost:4000/health
   ```

2. **Kiểm tra API URL trong frontend:**
   - File: `portal-ui-react/src/shared/api/client.ts`
   - Đảm bảo `BASE_URL` đúng: `http://localhost:4000`

3. **Kiểm tra CORS:**
   - File: `services/core/src/app.ts`
   - Đảm bảo CORS cho phép origin của frontend

4. **Kiểm tra port:**
   - Backend: `http://localhost:4000`
   - Frontend: `http://localhost:5173`

### 7. Seed Users Script Failed

**Triệu chứng:**
```
Error: Failed to create user
```

**Giải pháp:**

1. **Kiểm tra database connection:**
   ```bash
   curl http://localhost:4000/health
   ```

2. **Kiểm tra Firebase config:**
   - Đảm bảo Firebase credentials đúng trong `.env`
   - Test: `node check-env.js`

3. **Kiểm tra schema:**
   - Đảm bảo table `User` đã được tạo
   - Kiểm tra trong Neon Dashboard

4. **Xem logs chi tiết:**
   - Script sẽ hiển thị lỗi cụ thể trong terminal

### 8. Frontend không compile

**Triệu chứng:**
```
Failed to compile
TypeScript errors
```

**Giải pháp:**

1. **Kiểm tra TypeScript errors:**
   - Xem terminal nơi chạy `npm run dev`
   - Sửa các lỗi TypeScript

2. **Reinstall dependencies:**
   ```bash
   cd portal-ui-react
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Kiểm tra Node version:**
   ```bash
   node --version
   # Phải ≥ 18
   ```

### 9. Realtime Service không chạy

**Triệu chứng:**
```
Realtime service không start
Firebase error
```

**Giải pháp:**

1. **Kiểm tra `.env` trong `services/realtime/`:**
   ```bash
   cd services/realtime
   cat .env
   ```

2. **Đảm bảo Firebase config đúng:**
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`

3. **Kiểm tra logs:**
   - Xem terminal nơi chạy `npm run dev`
   - Tìm lỗi cụ thể

4. **Restart service:**
   ```bash
   # Dừng và chạy lại
   cd services/realtime
   npm run dev
   ```

### 10. Health Check trả về 500 nhưng database reachable

**Triệu chứng:**
```json
{
  "status": "error",
  "db": "reachable"
}
```

**Giải pháp:**

1. **Kiểm tra schema:**
   - Đảm bảo tables đã được tạo
   - Chạy `create-tables.sql` nếu chưa

2. **Kiểm tra Prisma client:**
   ```bash
   cd services/core
   npx prisma generate
   ```

3. **Restart service:**
   ```bash
   # Dừng và chạy lại
   cd services/core
   npm run dev
   ```

## 🔍 Debug Commands

### Test Database Connection

```bash
# Test Neon connection
node test-supabase-connection.js

# Test health endpoint
curl http://localhost:4000/health

# Test API endpoints
node test-api.js
```

### Check Environment Variables

```bash
# Check .env format
node check-env.js

# View .env (Windows)
type services\core\.env

# View .env (Mac/Linux)
cat services/core/.env
```

### Check Database Schema

Vào Neon Dashboard → SQL Editor và chạy:

```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check User table
SELECT * FROM "User" LIMIT 5;

-- Check table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'User';
```

### View Logs

Logs hiển thị trực tiếp trong terminal khi chạy `npm run dev`. Xem terminal của từng service để debug.

## 🔄 Reset Hoàn Toàn

Nếu mọi thứ không hoạt động, reset hoàn toàn:

1. **Xóa database và tạo lại:**
   - Vào Neon Dashboard
   - Xóa project hoặc database
   - Tạo lại project mới
   - Chạy `create-tables.sql`

2. **Reset environment:**
   ```bash
   # Xóa .env và tạo lại
   rm services/core/.env
   # Tạo lại với connection string mới
   ```

3. **Reinstall dependencies:**
   ```bash
   cd services/core
   rm -rf node_modules package-lock.json
   npm install
   
   cd ../realtime
   rm -rf node_modules package-lock.json
   npm install
   
   cd ../../portal-ui-react
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Restart tất cả services:**
   - Dừng tất cả terminals (Ctrl+C)
   - Chạy lại từng service

## 📞 Cần Hỗ Trợ?

1. **Thu thập thông tin:**
   ```bash
   # Health check
   curl http://localhost:4000/health > health-check.txt
   
   # Test API
   node test-api.js > api-test.txt
   
   # Check env
   node check-env.js > env-check.txt
   ```

2. **Kiểm tra trong Neon Dashboard:**
   - Connection string
   - Tables đã được tạo chưa
   - Query logs

3. **Xem tài liệu:**
   - [NEON_DB_SETUP.md](./NEON_DB_SETUP.md)
   - [NEON_ARCHITECTURE.md](./NEON_ARCHITECTURE.md)
   - [SETUP_GUIDE.md](./SETUP_GUIDE.md)
   - [RUN_SQL.md](./RUN_SQL.md)

---

**Xem thêm: [SETUP_GUIDE.md](./SETUP_GUIDE.md)**
