# 🚀 Hướng Dẫn Setup Dự Án USTH Academic Suite

Hướng dẫn chi tiết để setup và chạy dự án trên thiết bị mới.

## 📋 Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết

1. **Node.js** (khuyến nghị ≥ 18)
   - Windows: [Download Node.js](https://nodejs.org/)
   - Mac: `brew install node` hoặc [Download](https://nodejs.org/)
   - Linux: `sudo apt-get install nodejs npm`

2. **Git** (để clone project)
   - Windows: [Download Git](https://git-scm.com/download/win)
   - Mac: `brew install git` hoặc [Download](https://git-scm.com/download/mac)
   - Linux: `sudo apt-get install git`

3. **Text Editor** (để chỉnh sửa file .env)
   - VS Code, Notepad++, hoặc bất kỳ editor nào

4. **Neon Database Account** (miễn phí)
   - Đăng ký tại: https://console.neon.tech/
   - Tạo project mới và copy connection string

5. **Firebase Project**
   - Đăng ký tại: https://console.firebase.google.com/
   - Tạo project và lấy Service Account credentials

### Yêu Cầu Phần Cứng

- **RAM**: Tối thiểu 4GB (khuyến nghị 8GB)
- **Disk Space**: Tối thiểu 2GB trống
- **CPU**: Bất kỳ CPU hiện đại nào
- **Internet**: Cần kết nối internet để truy cập Neon Database và Firebase

## 📥 Bước 1: Clone Project

### Từ Git Repository

```bash
# Clone project
git clone https://github.com/NLonG41/GrpProject.git
cd GroupProject

# Hoặc nếu đã có project, pull latest changes
git pull origin master
```

### Từ File ZIP

1. Giải nén file ZIP vào thư mục bạn muốn
2. Mở terminal/command prompt trong thư mục đó

## ⚙️ Bước 2: Cài Đặt Dependencies

### Frontend

```bash
cd portal-ui-react
npm install
```

### Core Service

```bash
cd services/core
npm install
```

### Realtime Service

```bash
cd services/realtime
npm install
```

## 🔐 Bước 3: Cấu Hình Environment Variables

### 3.1. Neon Database Setup

1. Vào https://console.neon.tech/
2. Tạo project mới (hoặc dùng project có sẵn)
3. Copy connection string từ Neon Dashboard
4. Tạo file `.env` trong `services/core/`:

```env
# Neon Database Connection String
DATABASE_URL=postgresql://neondb_owner:password@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Service Port
PORT=4000

# Firebase Admin (for Auth verification)
FIREBASE_PROJECT_ID=web-portal-us
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@web-portal-us.iam.gserviceaccount.com
```

### 3.2. Tạo Database Schema

1. Vào Neon Dashboard → SQL Editor
2. Mở file `create-tables.sql` trong project root
3. Copy toàn bộ nội dung và paste vào SQL Editor
4. Click **Run** để tạo tables

Xem chi tiết trong `RUN_SQL.md`

### 3.3. Cấu hình Firebase

**Lấy thông tin Firebase:**

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. File JSON sẽ được tải về
6. Mở file JSON và copy:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (giữ nguyên dấu ngoặc kép và `\n`)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

**Lưu ý quan trọng:**
- `FIREBASE_PRIVATE_KEY` phải được đặt trong dấu ngoặc kép `"`
- Giữ nguyên các ký tự `\n` trong private key
- Không có khoảng trắng thừa

**Ví dụ đúng:**
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### 3.4. Cấu hình Frontend Firebase

Tạo file `.env` trong `portal-ui-react/` (nếu cần):

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=web-portal-us
```

Frontend đã có cấu hình Firebase sẵn trong `src/shared/config/firebase.ts`.

## 🚀 Bước 4: Chạy Dự Án

Mỗi service chạy ở một terminal riêng:

### Terminal 1: Core Service

```bash
cd services/core
npm run dev
```

Đợi đến khi thấy:
- `Core service running on http://localhost:4000`
- `"db": "reachable"` trong health check

### Terminal 2: Realtime Service

```bash
cd services/realtime
npm run dev
```

Đợi đến khi thấy:
- `Realtime service running on http://localhost:5002`

### Terminal 3: Frontend

```bash
cd portal-ui-react
npm run dev
```

Đợi đến khi thấy:
- `Local: http://localhost:5173`

## ✅ Bước 5: Kiểm Tra Dự Án Đã Chạy

### 5.1. Kiểm tra Core Service

```bash
# Test health endpoint
curl http://localhost:4000/health

# Hoặc mở trình duyệt
# http://localhost:4000/health
```

Kết quả mong đợi:
```json
{
  "status": "ok",
  "db": "reachable"
}
```

### 5.2. Kiểm tra Database

Vào Neon Dashboard → SQL Editor và chạy:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Bạn sẽ thấy các tables:
- `User`
- `Subject`
- `Class`
- `Room`
- `Enrollment`
- `ClassSchedule`
- `Notification`
- `Request`

### 5.3. Tạo tài khoản mẫu (50 users)

```bash
cd services/core
npm run seed:users
```

Script sẽ tạo:
- 30 sinh viên (CS/ICT/DS majors)
- 20 giảng viên (ICT Department)
- Tự động tạo trong Firebase Auth

### 5.4. Truy cập ứng dụng

Mở trình duyệt và truy cập:
- **Frontend**: http://localhost:5173
- **Core Service Health**: http://localhost:4000/health
- **Realtime Service**: http://localhost:5002

## 🛠️ Bước 6: Troubleshooting

### Vấn đề: Core service không kết nối được database

**Lỗi:** `"db": "unreachable"` trong health check

**Giải pháp:**
1. Kiểm tra `DATABASE_URL` trong `.env` có đúng không
2. Kiểm tra connection string có đầy đủ `sslmode=require` không
3. Kiểm tra password có đúng không
4. Thử test connection bằng script:
   ```bash
   node test-supabase-connection.js
   ```

### Vấn đề: Port đã được sử dụng

**Lỗi:** `EADDRINUSE: address already in use`

**Giải pháp:**
1. Kiểm tra port nào đang được dùng:
   ```bash
   # Windows
   netstat -ano | findstr :4000
   
   # Mac/Linux
   lsof -i :4000
   ```

2. Dừng process đang dùng port đó, hoặc
3. Thay đổi port trong `.env`:
   ```env
   PORT=4001
   ```

### Vấn đề: Firebase authentication failed

**Lỗi:** `Firebase authentication error` trong logs

**Giải pháp:**
1. Kiểm tra file `.env` có đúng format không
2. Đảm bảo `FIREBASE_PRIVATE_KEY` có dấu ngoặc kép và `\n`
3. Kiểm tra `FIREBASE_PROJECT_ID` và `FIREBASE_CLIENT_EMAIL` đúng chưa
4. Xem logs chi tiết trong terminal

### Vấn đề: Database schema không tồn tại

**Lỗi:** `relation "User" does not exist`

**Giải pháp:**
1. Vào Neon Dashboard → SQL Editor
2. Chạy file `create-tables.sql`
3. Hoặc chạy Prisma migrations:
   ```bash
   cd services/core
   npx prisma migrate deploy
   ```

### Vấn đề: Frontend không kết nối được backend

**Giải pháp:**
1. Kiểm tra backend đang chạy: `curl http://localhost:4000/health`
2. Kiểm tra CORS settings trong `services/core/src/app.ts`
3. Kiểm tra API URL trong frontend: `portal-ui-react/src/shared/api/client.ts`

## 📝 Các Lệnh Thường Dùng

### Dừng services

Nhấn `Ctrl+C` trong terminal của từng service.

### Xem logs

Logs hiển thị trực tiếp trong terminal khi chạy `npm run dev`.

### Restart service

1. Dừng service (`Ctrl+C`)
2. Chạy lại: `npm run dev`

### Test API

```bash
# Test health endpoint
curl http://localhost:4000/health

# Test API với script
node test-api.js
```

## 🎯 Checklist Setup

- [ ] Node.js đã được cài đặt (≥ 18)
- [ ] Project đã được clone/download
- [ ] Đã cài đặt dependencies cho tất cả services
- [ ] Đã tạo Neon Database và copy connection string
- [ ] Đã tạo file `.env` trong `services/core/` với Neon connection string
- [ ] Đã chạy `create-tables.sql` trong Neon SQL Editor
- [ ] Đã cấu hình Firebase credentials trong `.env`
- [ ] Đã chạy `npm run dev` cho core service
- [ ] Health check trả về `"db": "reachable"`
- [ ] Đã chạy `npm run dev` cho realtime service
- [ ] Đã chạy `npm run dev` cho frontend
- [ ] Có thể truy cập http://localhost:5173
- [ ] Đã chạy `npm run seed:users` để tạo tài khoản mẫu

## 📞 Hỗ Trợ

Nếu gặp vấn đề, hãy:
1. Xem logs trong terminal
2. Kiểm tra health endpoint: `curl http://localhost:4000/health`
3. Xem [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
4. Xem [NEON_DB_SETUP.md](./NEON_DB_SETUP.md)
5. Xem [NEON_ARCHITECTURE.md](./NEON_ARCHITECTURE.md)

## 🔄 Cập Nhật Project

Khi có code mới:

```bash
# Pull latest code
git pull origin master

# Cài đặt dependencies mới (nếu có)
cd services/core && npm install
cd ../realtime && npm install
cd ../../portal-ui-react && npm install

# Restart services
```

---

**Chúc bạn setup thành công! 🎉**
