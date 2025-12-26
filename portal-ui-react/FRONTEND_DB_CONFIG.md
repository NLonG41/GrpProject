# 🔍 Frontend Database Configuration - Kiểm tra

## ✅ Đã sửa

### 1. **Sửa Port API Backend** 
- **File**: `portal-ui-react/src/shared/api/client.ts`
- **Vấn đề**: Frontend đang config `CORE_API` với port `4000` nhưng backend chạy trên port `5001`
- **Đã sửa**: Thay đổi default port từ `4000` → `5001`

```typescript
// Trước:
const CORE_API = import.meta.env.VITE_CORE_API || 'http://localhost:4000'

// Sau:
const CORE_API = import.meta.env.VITE_CORE_API || 'http://localhost:5001'
```

## 📋 Cấu hình hiện tại

### API Endpoints
- **CORE_API**: `http://localhost:5001` (Backend Core Service - PostgreSQL)
- **REALTIME_API**: `http://localhost:5002` (Realtime Service - Firebase/Firestore)

### Firebase Configuration
- **File**: `portal-ui-react/src/shared/config/firebase.ts`
- **Status**: ✅ Đã config đúng với project `student-management-datab-bcfb1`
- **Services**: 
  - Firebase Auth ✅
  - Firestore ✅
  - Realtime Database ✅

## ⚠️ Vấn đề phát hiện

### 1. **Backend Services không đang chạy**
- Port 5001 (Core Service): ❌ Không mở
- Port 5002 (Realtime Service): ❌ Không mở

**Giải pháp**: Cần start backend services:
```bash
# Terminal 1 - Core Service
cd services/core
npm run dev

# Terminal 2 - Realtime Service  
cd services/realtime
npm run dev
```

### 2. **Thiếu file .env**
- Frontend không có file `.env` để override API endpoints
- Hiện tại đang dùng default values

**Giải pháp**: Tạo file `.env` trong `portal-ui-react/`:
```env
VITE_CORE_API=http://localhost:5001
VITE_REALTIME_API=http://localhost:5002
```

## 🔗 Kết nối Database

### Frontend → Backend → Database

```
Frontend (React)
    ↓ HTTP Requests
Backend Core Service (Port 5001)
    ↓ Prisma Client
PostgreSQL Database (Neon/Supabase)
```

### Frontend → Firebase

```
Frontend (React)
    ↓ Firebase SDK
Firebase Auth + Firestore
    ↓
Backend Realtime Service (Port 5002)
    ↓ Firebase Admin SDK
Firebase Services
```

## ✅ Checklist

- [x] Firebase config đúng project ID
- [x] API endpoints config đúng port
- [x] Có fallback values cho API endpoints
- [ ] Backend services đang chạy
- [ ] File .env được tạo (optional)
- [ ] Test kết nối với backend thành công

## 🚀 Cách test

### 1. Start Backend Services
```bash
# Core Service
cd services/core
npm run dev

# Realtime Service (nếu cần)
cd services/realtime
npm run dev
```

### 2. Start Frontend
```bash
cd portal-ui-react
npm run dev
```

### 3. Test Login
- Mở browser: `http://localhost:5173`
- Login với: `zzz@gmail.com` / `123123`
- Kiểm tra console để xem API calls

### 4. Kiểm tra Network Tab
- Mở DevTools → Network
- Xem các requests đến:
  - `http://localhost:5001/api/auth/firebase-login`
  - `http://localhost:5001/api/users`
  - `http://localhost:5002/notifications`

## 📝 Files liên quan

1. `portal-ui-react/src/shared/api/client.ts` - API client configuration
2. `portal-ui-react/src/shared/config/firebase.ts` - Firebase configuration
3. `portal-ui-react/.env.example` - Environment variables template
4. `services/core/src/config/env.ts` - Backend core config
5. `services/realtime/src/config/env.ts` - Backend realtime config

## 🎯 Kết luận

**Frontend đã được config chuẩn để kết nối với database** thông qua:
- ✅ API endpoints đúng port
- ✅ Firebase config đúng project
- ⚠️ Cần start backend services để test kết nối thực tế

