# 🎓 USTH Academic Suite

Hệ thống quản lý học tập và hỗ trợ sinh viên cho USTH.

## 🚀 Bắt đầu nhanh (không dùng Docker)

### Yêu cầu
- **Node.js** (khuyến nghị ≥ 18)
- **npm**
- **Neon Database** (PostgreSQL managed - dùng cho `services/core`)
- **Firebase project** (dùng cho `services/realtime` và frontend)

### 1. Clone project

   ```bash
   git clone https://github.com/NLonG41/GrpProject.git
   cd GroupProject
   ```

### 2. Cài đặt dependencies

- Frontend:
  ```bash
  cd portal-ui-react
  npm install
  ```

- Core service:
  ```bash
  cd services/core
  npm install
  ```

- Realtime service:
   ```bash
  cd services/realtime
  npm install
   ```

- (Tùy chọn) Mock `portal-api`:
   ```bash
  cd portal-api
  npm install
  ```

### 3. Cấu hình môi trường

- Tạo file `.env` cho từng service theo hướng dẫn trong thư mục tương ứng (xem thêm trong thư mục `readme/` và `portal-ui-react/README/`).  
- Cần cấu hình:
  - Kết nối **Neon Database** (PostgreSQL) cho `services/core` - xem `NEON_DB_SETUP.md`
  - Thông tin **Firebase** cho `services/realtime` và `portal-ui-react`.

### 4. Chạy các services ở chế độ development

Mỗi service chạy ở một terminal riêng:

- Frontend (Vite React):
  ```bash
  cd portal-ui-react
  npm run dev
  ```

- Core service (REST API, Prisma + Neon Database):
  ```bash
  cd services/core
  npm run dev
  ```

- Realtime service (Firebase / Firestore):
  ```bash
  cd services/realtime
  npm run dev
  ```

- (Tùy chọn) Mock `portal-api`:
```bash
  cd portal-api
  npm run dev
  ```

Sau khi tất cả services chạy, truy cập frontend tại địa chỉ Vite in ra (thường là `http://localhost:5173`).

## 👥 Vai trò trong hệ thống

Phiên bản hiện tại **chỉ giữ lại role ASSISTANT** trên frontend.  
Mọi module Student/Lecturer đã bị xoá khỏi mã nguồn React để tập trung vào bàn làm việc của học vụ.

- **ASSISTANT**  
  - Đăng nhập duy nhất được hỗ trợ.  
  - Có toàn quyền thao tác UI: quản lý lớp, lịch, phòng, gửi thông báo, xử lý request.

> Các role khác (nếu còn trong DB) chỉ dùng làm dữ liệu lịch sử; khi đăng nhập, frontend sẽ từ chối.

## 🗄️ Neon Database Setup

### 1. Cấu hình Connection String

Tạo file `.env` trong `services/core/`:

```env
DATABASE_URL=postgresql://neondb_owner:npg_f9RsDuCeHqZ7@ep-calm-water-a1d2bcmu-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=4000
```

### 2. Tạo Tables

Chạy SQL script trong Neon SQL Editor:

1. Vào Neon Dashboard: https://console.neon.tech/
2. Chọn project → **SQL Editor**
3. Mở file `create-tables.sql` và copy toàn bộ nội dung
4. Paste vào SQL Editor và click **Run**

Xem chi tiết trong `RUN_SQL.md` và `NEON_DB_SETUP.md`

### 3. Tạo tài khoản mẫu (50 users)

```bash
cd services/core
npm run seed:users
```

Script sẽ tạo 30 sinh viên (CS/ICT/DS) và 20 giảng viên, tự động tạo trong Firebase Auth.

### 4. Tạo Assistant thủ công (nếu cần)

```bash
curl -X POST http://localhost:4000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{
    \"fullName\": \"Academic Assistant\",
    \"email\": \"assistant@usth.edu.vn\",
    \"password\": \"USTH@123\",
    \"role\": \"ASSISTANT\"
  }"
```

## 📚 Tài liệu thêm

> ⭐ **Bắt đầu từ đây**: [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md) - Hướng dẫn đọc tất cả tài liệu theo thứ tự ưu tiên

- **[QUICK_START.md](./QUICK_START.md)** - Hướng dẫn nhanh 5 phút
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Hướng dẫn setup chi tiết
- **[readme/ARCHITECTURE.md](./readme/ARCHITECTURE.md)** - Kiến trúc hệ thống chi tiết
- **[RUN_SQL.md](./RUN_SQL.md)** - Hướng dẫn chạy SQL script
- **[DATABASE_ARCHITECTURE_RECOMMENDATION.md](./DATABASE_ARCHITECTURE_RECOMMENDATION.md)** - Kiến trúc Database
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Xử lý sự cố
- **[FEATURES_IMPLEMENTATION.md](./FEATURES_IMPLEMENTATION.md)** - Các tính năng đã triển khai

## 🏗️ Kiến trúc tổng quan

### Frontend Layer
- **portal-ui-react** (Vite + React + TypeScript)
  - Chỉ còn 2 modules: `assistant` và `auth`
  - UI tập trung vào Assistant Portal (quản lý lớp, lịch, phòng, thông báo)
  - Kết nối tới `services/core` (REST API) và `services/realtime` (Firebase)

### Backend Services
- **services/core** (Express + Prisma + Neon Database)
  - REST API chính: `/api/auth`, `/api/users`, `/api/subjects`, `/api/classes`, `/api/rooms`, `/api/schedule`, `/api/requests`
  - Database: **Neon Database** (PostgreSQL managed, serverless)
  - Schema đầy đủ (User, Subject, Class, Room, Enrollment, Schedule, Request, Notification)
  - Script seed: `npm run seed:users` để tạo 50 tài khoản mẫu

- **services/realtime** (Express + Firebase Admin)
  - Quản lý thông báo realtime qua Firestore
  - Endpoints: `/notifications`, `/rt/rooms/:id`

- **portal-api** (Mock API - tùy chọn)
  - Service mock cho demo/testing

### Database
- **Neon Database** (PostgreSQL serverless)
  - Schema được quản lý bởi Prisma
  - Migrations: Chạy SQL script trong `create-tables.sql` hoặc `npx prisma migrate deploy`
  - Connection pooling tự động
  - SSL required (`sslmode=require`)

### Data Flow
```
Frontend (React) 
  → Core Service (REST API) 
    → Neon Database (PostgreSQL via Prisma)
  → Realtime Service (Firebase)
    → Firestore (Notifications)
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Zustand, Firebase Auth SDK
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: Neon Database (PostgreSQL serverless), Firebase Firestore
- **Authentication**: Firebase Authentication (frontend) + Firebase Admin SDK (backend verification)

## 📞 Hỗ trợ

Xem `TROUBLESHOOTING.md` để xử lý các vấn đề thường gặp.

## 🔗 Repository

GitHub: [https://github.com/NLonG41/GrpProject](https://github.com/NLonG41/GrpProject)

---

**Made with ❤️ for USTH**
