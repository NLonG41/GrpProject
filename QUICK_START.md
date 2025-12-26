# ⚡ Quick Start Guide

Hướng dẫn nhanh để chạy dự án trong 5 phút.

## 📋 Yêu Cầu

- **Node.js** ≥ 18 đã được cài đặt
- **Neon Database** account (miễn phí tại https://console.neon.tech/)
- **Firebase** project (miễn phí tại https://console.firebase.google.com/)

## 🚀 5 Bước Đơn Giản

### Bước 1: Clone/Download Project

```bash
git clone https://github.com/NLonG41/GrpProject.git
cd GroupProject
```

### Bước 2: Cài đặt Dependencies

```bash
# Frontend
cd portal-ui-react
npm install
cd ..

# Core Service
cd services/core
npm install
cd ../..

# Realtime Service
cd services/realtime
npm install
cd ../..
```

### Bước 3: Setup Neon Database

1. Vào https://console.neon.tech/ và tạo project mới
2. Copy connection string
3. Tạo file `.env` trong `services/core/`:

```env
DATABASE_URL=postgresql://neondb_owner:password@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=4000
FIREBASE_PROJECT_ID=web-portal-us
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@web-portal-us.iam.gserviceaccount.com
```

4. Vào Neon SQL Editor và chạy file `create-tables.sql`

### Bước 4: Cấu hình Firebase

1. Vào Firebase Console → Project Settings → Service Accounts
2. Generate New Private Key
3. Copy thông tin vào `.env` (xem `FIREBASE_SERVICE_ACCOUNT_SETUP.md`)

### Bước 5: Chạy Project

Mở 3 terminal:

**Terminal 1 - Core Service:**
```bash
cd services/core
npm run dev
```

**Terminal 2 - Realtime Service:**
```bash
cd services/realtime
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd portal-ui-react
npm run dev
```

## ✅ Kiểm Tra

```bash
# Test health endpoint
curl http://localhost:4000/health

# Hoặc mở trình duyệt
# http://localhost:4000/health
```

Truy cập: **http://localhost:5173**

## 🗄️ Tạo Tài Khoản Mẫu

```bash
cd services/core
npm run seed:users
```

Script sẽ tạo 50 tài khoản (30 sinh viên + 20 giảng viên).

## 🛑 Dừng Project

Nhấn `Ctrl+C` trong mỗi terminal.

## 🔄 Restart

Dừng và chạy lại từ Bước 5.

---

**Chi tiết hơn? Xem [SETUP_GUIDE.md](./SETUP_GUIDE.md)**
