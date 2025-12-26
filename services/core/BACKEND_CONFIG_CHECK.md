# 🔍 Backend Core Service Configuration Check

## ✅ Đã kiểm tra

### 1. **Environment Variables** (.env)
- ✅ `DATABASE_URL`: Có (Neon PostgreSQL)
- ✅ `FIREBASE_PRIVATE_KEY`: Có
- ✅ `FIREBASE_CLIENT_EMAIL`: Có (đúng project: `student-management-datab-bcfb1`)
- ⚠️ `FIREBASE_PROJECT_ID`: Cần kiểm tra (có thể được extract từ CLIENT_EMAIL)

### 2. **Database Configuration**
- ✅ Prisma schema: PostgreSQL provider
- ✅ Prisma client: Sử dụng adapter-pg với connection pool
- ✅ Database URL: Neon PostgreSQL connection string
- ✅ Health check endpoint: `/health` với database ping

### 3. **Firebase Admin SDK**
- ✅ Firebase Admin được khởi tạo với credentials từ env
- ✅ Project ID: `student-management-datab-bcfb1` (từ CLIENT_EMAIL)
- ✅ Firebase login endpoint: `/api/auth/firebase-login`
- ✅ Token verification: Sử dụng `admin.auth().verifyIdToken()`

### 4. **API Routes**
- ✅ `/health` - Health check
- ✅ `/api/auth/login` - Traditional login
- ✅ `/api/auth/firebase-login` - Firebase login
- ✅ `/api/auth/register` - User registration
- ✅ `/api/users` - User management
- ✅ `/api/subjects` - Subjects CRUD
- ✅ `/api/rooms` - Rooms CRUD
- ✅ `/api/classes` - Classes CRUD
- ✅ `/api/requests` - Requests CRUD
- ✅ `/schedules` - Schedule management

### 5. **CORS Configuration**
- ✅ CORS enabled: `app.use(cors())`
- ⚠️ CORS config: Đang dùng default (cho phép tất cả origins)
- 💡 **Khuyến nghị**: Nên config cụ thể cho production

### 6. **Port Configuration**
- ✅ Default port: `5001`
- ✅ Configurable: `process.env.PORT || 5001`

### 7. **Error Handling**
- ✅ Global error handler middleware
- ✅ Try-catch trong các routes
- ✅ Proper HTTP status codes

## ⚠️ Vấn đề phát hiện

### 1. **FIREBASE_PROJECT_ID có thể thiếu**
- Firebase Admin SDK có thể extract từ CLIENT_EMAIL, nhưng nên set rõ ràng
- **Giải pháp**: Thêm vào `.env`:
```env
FIREBASE_PROJECT_ID=student-management-datab-bcfb1
```

### 2. **CORS Configuration quá mở**
- Hiện tại: `app.use(cors())` cho phép tất cả origins
- **Khuyến nghị**: Config cụ thể cho production:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 3. **Prisma Schema thiếu datasource URL**
- Schema chỉ có `provider = "postgresql"` nhưng không có `url`
- **Không sao**: Prisma sẽ lấy từ `DATABASE_URL` env var hoặc `prisma.config.ts`

## ✅ Checklist

- [x] Database connection config
- [x] Firebase Admin SDK config
- [x] API routes setup
- [x] CORS enabled
- [x] Error handling
- [x] Health check endpoint
- [ ] FIREBASE_PROJECT_ID trong .env (optional nhưng recommended)
- [ ] CORS config cụ thể (optional cho production)

## 🔗 Kết nối

### Frontend → Backend
```
Frontend (localhost:5173)
    ↓ HTTP Requests
Backend Core (localhost:5001)
    ↓ CORS enabled
    ↓ Express routes
    ↓ Prisma Client
PostgreSQL (Neon)
```

### Firebase Auth Flow
```
Frontend
    ↓ Firebase Auth SDK
Firebase Auth
    ↓ ID Token
Backend (/api/auth/firebase-login)
    ↓ Firebase Admin SDK verify
Firebase Admin
    ↓ User email
Database (Prisma)
    ↓ User data
Response
```

## 🚀 Test Configuration

### 1. Test Database Connection
```bash
cd services/core
npm run dev
# Check: http://localhost:5001/health
```

### 2. Test Firebase Login
```bash
# Use test script
node test-firebase-login.mjs
# Or use frontend login page
```

### 3. Test API Endpoints
```bash
# Health check
curl http://localhost:5001/health

# Firebase login (cần ID token từ frontend)
curl -X POST http://localhost:5001/api/auth/firebase-login \
  -H "Content-Type: application/json" \
  -d '{"idToken": "YOUR_TOKEN"}'
```

## 📝 Files quan trọng

1. `services/core/src/config/env.ts` - Environment config
2. `services/core/src/lib/prisma.ts` - Database client
3. `services/core/src/lib/firebase.ts` - Firebase Admin SDK
4. `services/core/src/app.ts` - Express app setup
5. `services/core/src/routes/auth.ts` - Authentication routes
6. `services/core/.env` - Environment variables
7. `services/core/prisma/schema.prisma` - Database schema

## 🎯 Kết luận

**Backend Core Service đã được config đúng** với:
- ✅ Database connection (Neon PostgreSQL)
- ✅ Firebase Admin SDK
- ✅ API routes đầy đủ
- ✅ CORS enabled
- ⚠️ Có thể cải thiện: CORS config cụ thể và FIREBASE_PROJECT_ID rõ ràng

