# Hướng dẫn Fix Lỗi "Forbidden" khi đổi Role

## Vấn đề
Khi đổi role của user, gặp lỗi **403 Forbidden: Admin access required**.

## Nguyên nhân
User ID trong `localStorage` không khớp với database (có thể là ID cũ từ trước khi reset database).

## Giải pháp

### Cách 1: Clear localStorage và đăng nhập lại (Khuyến nghị)

1. **Mở Browser Console:**
   - Nhấn `F12` hoặc `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Chuyển sang tab **Console**

2. **Clear localStorage:**
   ```javascript
   localStorage.clear()
   ```

3. **Refresh trang:**
   - Nhấn `F5` hoặc `Ctrl+R`

4. **Đăng nhập lại:**
   - Email: `admin@usth.edu.vn`
   - Password: `admin123`

5. **Thử đổi role lại**

### Cách 2: Kiểm tra User ID

1. **Mở Console (F12)**

2. **Kiểm tra user ID hiện tại:**
   ```javascript
   const user = JSON.parse(localStorage.getItem('currentUser'));
   console.log('Current User ID:', user?.id);
   console.log('Current User Email:', user?.email);
   console.log('Current User Role:', user?.role);
   ```

3. **So sánh với database:**
   - Admin user ID trong database: `f9cd1e43-9f07-4ec8-bd1d-4501ec253e8f`
   - Nếu ID khác → Clear localStorage và đăng nhập lại

### Cách 3: Sử dụng Script

Chạy script để kiểm tra user trong database:
```bash
cd services/core
node scripts/check-admin-sql.js
```

## User IDs hiện tại trong Database

- **Admin:** `f9cd1e43-9f07-4ec8-bd1d-4501ec253e8f` (admin@usth.edu.vn)
- **Assistant:** `efa1edab-7568-4aa1-a3be-4fb1cb71ac39` (assistant@usth.edu.vn)

## Test API

Để test API trực tiếp:
```bash
cd services/core
node scripts/test-role-update.js
```

## Lưu ý

- Sau khi reset database, **phải đăng nhập lại** để lấy user ID mới
- User ID trong localStorage phải khớp với database
- Chỉ **ADMIN** và **ASSISTANT** mới có quyền đổi role

