# Fix Requests API - Hướng dẫn sửa lỗi fetch requests

## Vấn đề
- Frontend không thể fetch được danh sách requests từ database
- API endpoint `/api/requests` trả về lỗi "Failed to fetch requests"
- Database có dữ liệu nhưng không thể query được

## Nguyên nhân
1. **Prisma client chưa được generate** - Đã sửa ✅
2. **Backend cần restart** để load Prisma client mới - Cần làm ⚠️

## Đã sửa

### 1. Generate Prisma Client
```bash
cd services/core
npx prisma generate
```
✅ Đã hoàn thành

### 2. Cải thiện Error Handling
Đã cập nhật `services/core/src/routes/requests.ts` để:
- Xử lý lỗi tốt hơn với fallback query
- Log chi tiết hơn để debug
- Trả về requests ngay cả khi không có sender relation

### 3. Sửa lỗi JSX
Đã sửa lỗi đóng thẻ trong `RequestSection.tsx`

## Cần làm tiếp

### Restart Backend Service
Backend cần restart để load Prisma client mới đã được generate:

```bash
# Dừng backend hiện tại (Ctrl+C trong terminal đang chạy backend)
# Hoặc kill process:
# Windows PowerShell:
Get-Process -Name node | Where-Object {$_.Path -like "*services\core*"} | Stop-Process

# Sau đó start lại:
cd services/core
npm run dev
```

### Kiểm tra
Sau khi restart, test API:
```bash
curl http://localhost:4000/api/requests
```

Hoặc mở browser và vào:
```
http://localhost:4000/api/requests
```

## Kiểm tra Database Connection
Nếu vẫn còn lỗi, kiểm tra:
1. Database connection string trong `.env` file
2. Database có đang accessible không
3. Xem logs của backend để biết lỗi cụ thể

## Test Frontend
Sau khi backend restart và API hoạt động:
1. Refresh trang frontend
2. Kiểm tra Request Center section
3. Dữ liệu requests sẽ hiển thị














