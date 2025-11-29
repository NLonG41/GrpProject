# Role-Based Routing & Access Control

## Tổng quan

Hệ thống sử dụng **Core Service (PostgreSQL)** cho authentication và role-based routing.

## Cấu trúc

### 1. Assistant Portal (`index.html` + `main.js`)
- **Role:** Chỉ `ADMIN` được truy cập
- **Chức năng:** Quản lý đào tạo, xếp lịch, request center
- **Access Control:** Check role khi render, redirect nếu không phải ADMIN

### 2. Student Portal (`student.html` + `student.js`)
- **Role:** Chỉ `STUDENT` được truy cập
- **Chức năng:** Xem khóa học, đăng ký môn, xem điểm, lịch học, thông báo
- **Real-time:** Subscribe Firestore cho room status và notifications

### 3. Lecturer Portal (`lecturer.html` + `lecturer.js`)
- **Role:** Chỉ `LECTURER` được truy cập
- **Chức năng:** Quản lý lớp học, tạo request (xin nghỉ, dạy bù)

## Authentication Flow

1. **Login** (`main.js`):
   - User đăng nhập qua `POST /api/auth/login`
   - Lưu user vào `localStorage` với key `currentUser`
   - Route dựa trên role:
     - `ADMIN` → Stay on Assistant Portal
     - `STUDENT` → Redirect to `./student.html`
     - `LECTURER` → Redirect to `./lecturer.html`

2. **Access Control**:
   - Mỗi portal check role khi load
   - Nếu role không đúng → Alert + Redirect về login
   - Nếu chưa login → Redirect về login

3. **Logout**:
   - Xóa `localStorage.currentUser`
   - Redirect về login page

## Files

```
portal-ui/
├── index.html          # Assistant Portal (ADMIN only)
├── main.js            # Assistant Portal logic
├── student.html       # Student Portal (STUDENT only)
├── student.js         # Student Portal logic + Firestore subscriptions
├── lecturer.html      # Lecturer Portal (LECTURER only)
├── lecturer.js        # Lecturer Portal logic
└── src/
    ├── api/
    │   └── client.js  # API client for Core Service
    └── routing.js     # Role-based routing utilities
```

## Testing

1. **Test ADMIN login:**
   - Login với email/password của ADMIN
   - Should stay on Assistant Portal
   - Should see all management features

2. **Test STUDENT login:**
   - Login với email/password của STUDENT
   - Should redirect to Student Portal
   - Should see courses, notifications, room status

3. **Test LECTURER login:**
   - Login với email/password của LECTURER
   - Should redirect to Lecturer Portal
   - Should see classes and requests

4. **Test Access Control:**
   - Try accessing `student.html` when logged in as ADMIN
   - Should show alert and redirect
   - Try accessing `index.html` when logged in as STUDENT
   - Should show alert and redirect

