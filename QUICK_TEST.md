# 🧪 Quick Test Guide

## Bước 1: Khởi động Core Service

Mở terminal và chạy:

```bash
cd services/core
npm run dev
```

Đợi đến khi thấy log: `Server running on port 5001`

## Bước 2: Chạy Test (Terminal mới)

Mở terminal mới (giữ nguyên terminal đang chạy service) và chạy:

```bash
cd D:\GroupProject
node test-api.js
```

## Kết quả mong đợi

Nếu service đang chạy, bạn sẽ thấy:

```
🚀 Starting API Tests...
==============================

🧪 Testing: GET /health
   Status: 200
✅ PASS: GET /health

🧪 Testing: GET /api/users
   Status: 200
   Found X users
✅ PASS: GET /api/users

...
```

## Nếu vẫn lỗi

1. **Kiểm tra service có chạy không:**
   ```bash
   curl http://localhost:5001/health
   ```

2. **Kiểm tra port 5001 có bị chiếm không:**
   ```powershell
   netstat -ano | findstr :5001
   ```

3. **Kiểm tra .env file:**
   - Đảm bảo `DATABASE_URL` đúng
   - Đảm bảo Firebase config đúng (nếu dùng Firebase Auth)

4. **Xem logs trong terminal chạy service** để biết lỗi cụ thể




