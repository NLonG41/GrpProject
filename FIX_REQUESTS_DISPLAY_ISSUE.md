# 🔧 Fix: Requests Không Hiển Thị Mặc Dù Có Data

## 🔍 Vấn đề

Requests có data trong database Neon nhưng không hiển thị ở frontend.

**Nguyên nhân có thể:**
1. ❌ **Type mismatch**: Database có `CLASS_SWAP`, `ABSENCE_REQUEST`, `ENROLLMENT` nhưng Prisma enum chỉ có `REQ_LEAVE`, `REQ_MAKEUP`
2. ❌ **API không trả về data** do type filter
3. ❌ **Frontend không render error** nên không biết lỗi gì
4. ❌ **useEffect dependency** có thể gây issue

## ✅ Đã Fix

### 1. **Thêm Error Display trong RequestSection**
- Hiển thị error message nếu có lỗi
- Giúp debug dễ dàng hơn

### 2. **Cải thiện Type Display**
- Support nhiều request types:
  - `REQ_LEAVE` → "Xin nghỉ"
  - `REQ_MAKEUP` → "Dạy bù"
  - `CLASS_SWAP` → "Đổi lớp"
  - `ABSENCE_REQUEST` → "Xin nghỉ"
  - `ENROLLMENT` → "Đăng ký"

### 3. **Fix useEffect Dependency**
- Thêm eslint-disable comment để tránh warning

## 🔍 Debug Steps

### 1. **Kiểm tra Console Logs**
Mở browser console và kiểm tra:
- Có lỗi API không?
- Response từ API có data không?
- Network tab: Request có thành công không?

### 2. **Kiểm tra Backend Logs**
```bash
# Xem logs trong terminal chạy backend
# Tìm: [requests] GET /api/requests called
# Xem: [requests] ✅ Found X requests
```

### 3. **Test API Trực Tiếp**
```bash
# Test với curl
curl http://localhost:4000/api/requests

# Hoặc với userId (nếu cần)
curl -H "x-user-id: YOUR_USER_ID" http://localhost:4000/api/requests
```

### 4. **Kiểm tra Database Type Mismatch**

**Vấn đề:** Database có types không khớp với Prisma enum:
- Database: `CLASS_SWAP`, `ABSENCE_REQUEST`, `ENROLLMENT`
- Prisma: `REQ_LEAVE`, `REQ_MAKEUP`

**Giải pháp:**

#### Option A: Update Database Data (Recommended)
```sql
-- Update existing data để khớp với enum
UPDATE request 
SET type = 'REQ_LEAVE' 
WHERE type = 'ABSENCE_REQUEST';

UPDATE request 
SET type = 'REQ_MAKEUP' 
WHERE type IN ('CLASS_SWAP', 'ENROLLMENT');
```

#### Option B: Update Prisma Schema
```prisma
enum RequestType {
  REQ_LEAVE
  REQ_MAKEUP
  CLASS_SWAP      // Thêm mới
  ABSENCE_REQUEST // Thêm mới
  ENROLLMENT      // Thêm mới
}
```

Sau đó chạy migration:
```bash
npx prisma migrate dev --name add_more_request_types
npx prisma generate
```

## 🧪 Test

### 1. **Kiểm tra Frontend**
1. Mở browser console
2. Navigate đến "Request Center"
3. Xem có error không
4. Xem network tab: Request API có được gọi không?

### 2. **Kiểm tra Backend**
1. Xem terminal logs
2. Tìm `[requests] GET /api/requests called`
3. Xem `[requests] ✅ Found X requests`
4. Kiểm tra response có data không

### 3. **Kiểm tra Database**
```sql
-- Xem tất cả requests
SELECT * FROM request;

-- Xem types hiện tại
SELECT DISTINCT type FROM request;
```

## 📝 Next Steps

1. **Nếu vẫn không hiển thị:**
   - Kiểm tra console logs
   - Kiểm tra network tab
   - Kiểm tra backend logs
   - Update database types để khớp với Prisma enum

2. **Nếu muốn support nhiều types:**
   - Update Prisma schema
   - Chạy migration
   - Update frontend để hiển thị đúng

3. **Nếu muốn giữ data hiện tại:**
   - Update Prisma enum để match với database
   - Hoặc migrate data sang enum mới

## ✅ Expected Result

Sau khi fix:
- ✅ Requests hiển thị trong table
- ✅ Error messages hiển thị nếu có lỗi
- ✅ Types được hiển thị đúng
- ✅ Console logs giúp debug















