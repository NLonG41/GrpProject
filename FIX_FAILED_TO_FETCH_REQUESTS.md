# 🔧 Fix: "Failed to fetch requests" Error

## 🔍 Vấn đề

Frontend hiển thị lỗi: **"Failed to fetch requests"**

**Nguyên nhân có thể:**
1. ❌ Backend không đang chạy
2. ❌ CORS issue
3. ❌ Network error
4. ❌ API endpoint không đúng

## ✅ Đã Fix

### 1. **Cải thiện Error Handling trong API Client**
- ✅ Thêm timeout (10 giây)
- ✅ Better error messages
- ✅ Console logs để debug
- ✅ Handle network errors

### 2. **Cải thiện Error Handling trong Hook**
- ✅ Console logs để debug
- ✅ Better error messages
- ✅ User-friendly error messages

## 🧪 Kiểm tra Backend

### Bước 1: Kiểm tra Backend có đang chạy không

```bash
# Terminal 1: Start backend
cd services/core
npm run dev

# Terminal 2: Test health endpoint
curl http://localhost:4000/health

# Expected: {"status":"ok"}
```

### Bước 2: Test Requests API

```bash
# Test GET /api/requests
curl http://localhost:4000/api/requests

# Expected: JSON array of requests
```

### Bước 3: Kiểm tra Browser Console

1. Mở browser DevTools (F12)
2. Xem tab **Console**:
   - `[API Client] CORE_API: http://localhost:4000`
   - `[API] getRequests: { url: '...', userId: '...' }`
   - `[useRequests] Loading requests...`
   - Error messages nếu có

3. Xem tab **Network**:
   - Request `GET /api/requests` có được gọi không?
   - Status code là gì? (200, 404, 500, etc.)
   - Response là gì?

## 🔧 Troubleshooting

### Nếu Backend không chạy:

```bash
# 1. Navigate to backend directory
cd services/core

# 2. Install dependencies (nếu chưa)
npm install

# 3. Check .env file có đúng không
# DATABASE_URL=...
# PORT=4000

# 4. Start backend
npm run dev

# Expected output:
# Server running on http://localhost:4000
```

### Nếu Backend chạy nhưng vẫn lỗi:

1. **Kiểm tra CORS:**
   - Backend đã config CORS chưa?
   - File: `services/core/src/app.ts`
   - CORS phải allow origin của frontend

2. **Kiểm tra Port:**
   - Backend chạy trên port 4000?
   - Frontend config đúng `http://localhost:4000`?

3. **Kiểm tra Database:**
   - Database connection có OK không?
   - Xem backend logs có lỗi database không?

4. **Kiểm tra Auth:**
   - User có đăng nhập không?
   - `user.id` có được truyền vào API không?

## 📝 Debug Steps

### 1. **Kiểm tra Backend Logs**

Trong terminal chạy backend, tìm:
```
[requests] GET /api/requests called { status: undefined, type: undefined, senderId: undefined }
[requests] ✅ Found X requests
```

Nếu không thấy logs này → Request không đến backend

### 2. **Kiểm tra Browser Network Tab**

1. Mở DevTools → Network tab
2. Filter: "requests"
3. Click vào request `GET /api/requests`
4. Xem:
   - **Status**: 200 (OK) hay error?
   - **Headers**: Request headers có đúng không?
   - **Response**: Có data không?

### 3. **Kiểm tra Console Logs**

Tìm các logs:
- `[API Client] CORE_API: http://localhost:4000`
- `[API] getRequests: { url: '...', userId: '...' }`
- `[useRequests] Loading requests...`
- `[useRequests] Loaded requests: { count: X }`

## ✅ Expected Result

Sau khi fix:
- ✅ Backend chạy trên port 4000
- ✅ Health endpoint trả về `{"status":"ok"}`
- ✅ Requests API trả về array of requests
- ✅ Frontend hiển thị requests trong table
- ✅ Không còn lỗi "Failed to fetch requests"

## 🚀 Quick Fix

Nếu backend không chạy, chạy lệnh sau:

```bash
# Terminal 1: Start backend
cd services/core
npm run dev

# Terminal 2: Start frontend (nếu chưa)
cd portal-ui-react
npm run dev
```

Sau đó refresh browser và kiểm tra lại.














