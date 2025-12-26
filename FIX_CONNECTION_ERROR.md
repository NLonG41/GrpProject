# Hướng dẫn Fix Lỗi Connection Refused

## 🔴 Vấn đề

Frontend không thể kết nối đến backend API, lỗi `ERR_CONNECTION_REFUSED`.

## ✅ Đã sửa

### 1. **Đồng bộ Port Configuration**
- Backend default port: `5001` → `4000` (theo ARCHITECTURE.md)
- Frontend default port: `5001` → `4000` (khớp với backend)
- Files: 
  - `services/core/src/config/env.ts`
  - `portal-ui-react/src/shared/api/client.ts`

### 2. **Cải thiện CORS Config**
- Thêm CORS config chi tiết hơn
- Allow all origins trong development
- File: `services/core/src/app.ts`

### 3. **Thêm Connection Error Component**
- Component hiển thị lỗi kết nối rõ ràng
- Tự động kiểm tra kết nối mỗi 5 giây
- File: `portal-ui-react/src/shared/components/ConnectionError.tsx`

### 4. **Cải thiện Error Handling**
- Thêm timeout cho fetch requests
- Thông báo lỗi rõ ràng hơn
- File: `portal-ui-react/src/shared/api/client.ts`

## 🚀 Cách khắc phục

### Bước 1: Tạo file .env cho Frontend

Tạo file `portal-ui-react/.env`:
```bash
VITE_CORE_API=http://localhost:4000
VITE_REALTIME_API=http://localhost:5002
```

### Bước 2: Đảm bảo Backend đang chạy

```bash
cd services/core
npm run dev
```

Backend sẽ chạy trên: `http://localhost:4000`

### Bước 3: Kiểm tra Health Endpoint

```bash
curl http://localhost:4000/health
```

Nếu thành công, sẽ trả về: `{ "status": "ok" }`

### Bước 4: Restart Frontend

```bash
cd portal-ui-react
npm run dev
```

## 🔍 Debug

### Kiểm tra Console
- Mở Browser DevTools → Console
- Xem log `[API Client] CORE_API: http://localhost:4000`
- Nếu vẫn lỗi, kiểm tra:
  1. Backend có đang chạy không?
  2. Port có đúng không?
  3. CORS có được config đúng không?

### Test API trực tiếp
```bash
# Test health endpoint
curl http://localhost:4000/health

# Test users endpoint (cần x-user-id header)
curl -H "x-user-id: YOUR_USER_ID" http://localhost:4000/api/users
```

## 📝 Checklist

- [x] Cập nhật default port trong client.ts
- [x] Cải thiện CORS config
- [x] Thêm ConnectionError component
- [x] Cải thiện error handling với timeout
- [ ] Tạo file .env cho frontend (user cần làm)
- [ ] Đảm bảo backend đang chạy (user cần làm)

## 💡 Lưu ý

- Backend mặc định chạy trên port **4000** (theo ARCHITECTURE.md)
- Frontend sẽ tự động dùng port **4000** nếu không có .env
- ConnectionError component sẽ tự động hiển thị nếu không kết nối được
- Component sẽ tự động retry mỗi 5 giây

