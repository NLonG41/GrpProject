# Quick Check User Role - Hướng dẫn nhanh

## Vấn đề
Console log hiển thị role LECTURER nhưng bạn login với admin.

## Giải pháp nhanh:

### Bước 1: Clear localStorage
Mở Console (F12) và chạy:
```javascript
localStorage.clear();
location.reload();
```

### Bước 2: Kiểm tra trong Database

#### Cách 1: Dùng Prisma Studio (Dễ nhất)
```bash
cd services/core
npx prisma studio
```
- Mở browser tại `http://localhost:5555`
- Chọn table `User`
- Tìm `admin@usth.edu.vn`
- Kiểm tra cột `role` - phải là `ADMIN`

#### Cách 2: Dùng SQL trực tiếp
```bash
psql -U postgres -d usth_portal
```

Chạy SQL:
```sql
SELECT email, "fullName", role 
FROM "User" 
WHERE email = 'admin@usth.edu.vn';
```

### Bước 3: Sửa role nếu sai

#### Dùng Prisma Studio:
1. Click vào user `admin@usth.edu.vn`
2. Đổi `role` từ `LECTURER` → `ADMIN`
3. Click Save

#### Dùng SQL:
```sql
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'admin@usth.edu.vn';
```

### Bước 4: Clear và login lại
```javascript
localStorage.clear();
location.reload();
```

Sau đó login lại với `admin@usth.edu.vn`.

## Valid Roles:
- `ADMIN` → index.html (Assistant Portal)
- `LECTURER` → lecturer.html
- `STUDENT` → student.html


