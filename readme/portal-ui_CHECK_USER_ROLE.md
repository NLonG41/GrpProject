# Hướng dẫn kiểm tra và sửa User Role trong PostgreSQL

## Vấn đề
Console log hiển thị `[UI] checkExistingAuth - User role: LECTURER` nhưng bạn đang login với tài khoản admin.

## Nguyên nhân có thể:
1. **localStorage đang lưu role cũ** từ lần login trước
2. **Database có role sai** - user trong PostgreSQL có role không đúng
3. **Login API trả về role sai**

## Cách kiểm tra:

### Bước 1: Clear localStorage (Thử trước)
Mở Console (F12) và chạy:
```javascript
localStorage.clear();
location.reload();
```

Sau đó login lại với `admin@usth.edu.vn`.

### Bước 2: Kiểm tra role trong PostgreSQL Database

#### Cách 1: Dùng script (Khuyên dùng)
```bash
cd services/core
node scripts/check-user-role.js admin@usth.edu.vn
```

Script sẽ hiển thị:
- Email, Full Name, Role hiện tại
- Tất cả users trong database
- Hướng dẫn update role nếu cần

#### Cách 2: Dùng Prisma Studio (GUI)
```bash
cd services/core
npx prisma studio
```
- Mở browser tại `http://localhost:5555`
- Chọn table `User`
- Tìm user với email `admin@usth.edu.vn`
- Kiểm tra cột `role`

#### Cách 3: Dùng psql (Command line)
```bash
psql -U postgres -d usth_portal
```

Sau đó chạy SQL:
```sql
SELECT id, email, "fullName", role, "createdAt" 
FROM "User" 
WHERE email = 'admin@usth.edu.vn';
```

### Bước 3: Sửa role nếu sai

#### Cách 1: Dùng script (Khuyên dùng)
```bash
cd services/core
node scripts/update-user-role.js admin@usth.edu.vn ADMIN
```

#### Cách 2: Dùng Prisma Studio
1. Mở Prisma Studio: `npx prisma studio`
2. Tìm user `admin@usth.edu.vn`
3. Click vào user để edit
4. Đổi `role` thành `ADMIN`
5. Save

#### Cách 3: Dùng SQL
```sql
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'admin@usth.edu.vn';
```

### Bước 4: Sau khi sửa
1. **Clear localStorage:**
   ```javascript
   localStorage.clear();
   ```
2. **Refresh trang**
3. **Login lại** với `admin@usth.edu.vn`

## Debug thêm:

### Kiểm tra localStorage
Mở Console và chạy:
```javascript
const user = JSON.parse(localStorage.getItem("currentUser") || "null");
console.log("User in localStorage:", user);
console.log("Role:", user?.role);
```

### Kiểm tra API response
Mở Network tab trong DevTools:
1. Login với `admin@usth.edu.vn`
2. Tìm request `POST /api/auth/login`
3. Xem Response - kiểm tra `user.role`

## Scripts có sẵn:

1. **Check user role:**
   ```bash
   node scripts/check-user-role.js <email>
   ```

2. **Update user role:**
   ```bash
   node scripts/update-user-role.js <email> <role>
   ```

3. **List all users:**
   ```bash
   node scripts/list-users.js
   ```

## Valid Roles:
- `ADMIN` - Assistant Portal (index.html)
- `LECTURER` - Lecturer Portal (lecturer.html)
- `STUDENT` - Student Portal (student.html)


