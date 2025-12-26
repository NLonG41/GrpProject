# Căn chỉnh tính năng theo Use Case Diagram - Assistant Portal

## 📋 Tổng quan

Đã kiểm tra và căn chỉnh tất cả các tính năng theo Use Case Diagram. Hệ thống chỉ tập trung vào **Assistant** role, không bao gồm Lecturer và Student.

## ✅ Use Cases từ Diagram

### 1. **Manage master data** (Quản lý dữ liệu chính)
**Includes:**
- ✅ **Manage Subjects** - Quản lý môn học
- ✅ **Manage Facilities** - Quản lý phòng học (Rooms)
- ✅ **Manage Classes** - Quản lý lớp học

**Routes đã bảo vệ:**
- `POST /api/subjects` - Tạo môn học (Assistant only)
- `PUT /api/subjects/:id` - Cập nhật môn học (Assistant only)
- `DELETE /api/subjects/:id` - Xóa môn học (Assistant only)
- `GET /api/subjects` - Xem danh sách (Public - để xem)

- `POST /api/rooms` - Tạo phòng học (Assistant only)
- `PUT /api/rooms/:id` - Cập nhật phòng học (Assistant only)
- `DELETE /api/rooms/:id` - Xóa phòng học (Assistant only)
- `GET /api/rooms` - Xem danh sách (Public - để xem)

- `POST /api/classes` - Tạo lớp học (Assistant only)
- `PUT /api/classes/:id` - Cập nhật lớp học (Assistant only)
- `DELETE /api/classes/:id` - Xóa lớp học (Assistant only)
- `GET /api/classes` - Xem danh sách (Public - để xem)

### 2. **Manage schedule** (Quản lý lịch học)
**Includes:**
- ✅ **Manual Scheduling** - Tạo/sửa lịch thủ công
- ✅ **Import Schedule by excel** - Import lịch từ Excel (cần implement)

**Routes đã bảo vệ:**
- `POST /api/schedules` - Tạo lịch học (Assistant only)
- `PUT /api/schedules/:id` - Cập nhật lịch học (Assistant only)
- `DELETE /api/schedules/:id` - Xóa lịch học (Assistant only)
- `GET /api/schedules` - Xem danh sách (Public - để xem)

**TODO:** Cần thêm endpoint `POST /api/schedules/import-excel` để import từ Excel

### 3. **View Analytics Dashboard** (Xem bảng phân tích)
**Status:** ⚠️ Chưa có endpoint
**TODO:** Cần tạo endpoint `GET /api/analytics/dashboard` để lấy dữ liệu phân tích

### 4. **Handle Requests** (Xử lý yêu cầu)
**Includes:**
- ✅ **Approve or decline Request** - Phê duyệt/từ chối yêu cầu

**Routes đã bảo vệ:**
- `PUT /api/requests/:id` - Cập nhật trạng thái request (Assistant only)
- `GET /api/requests` - Xem danh sách requests (Public - để xem)
- `GET /api/requests/:id` - Xem chi tiết request (Public - để xem)

## 🔒 Middleware Authentication

**File:** `services/core/src/middleware/auth.ts`

Đã tạo middleware mới:
- `requireAssistant` - Kiểm tra user có role ASSISTANT hoặc ADMIN
- `requireAuth` - Kiểm tra user đã đăng nhập (bất kỳ role nào)

**Sử dụng:**
```typescript
import { requireAssistant, requireAuth } from "../middleware/auth";

// Chỉ Assistant mới được truy cập
router.post("/", requireAssistant, async (req, res) => {
  // ...
});

// Bất kỳ user nào đã đăng nhập
router.get("/", requireAuth, async (req, res) => {
  // ...
});
```

## 📝 Routes không thuộc Use Case Assistant

Các routes sau **KHÔNG** thuộc use case của Assistant (thuộc về Lecturer):
- **GradeItems** - Quản lý thành phần điểm (Lecturer)
- **Attendance** - Quản lý điểm danh (Lecturer)
- **GradeRecords** - Quản lý bảng điểm (Lecturer)

**Lưu ý:** Các routes này vẫn được giữ lại trong codebase để dùng cho tương lai, nhưng đã thêm comment rõ ràng rằng chúng không thuộc use case Assistant.

## ✅ Routes đã được bảo vệ

### Master Data Management
- ✅ `POST /api/subjects` - requireAssistant
- ✅ `PUT /api/subjects/:id` - requireAssistant
- ✅ `DELETE /api/subjects/:id` - requireAssistant
- ✅ `POST /api/rooms` - requireAssistant
- ✅ `PUT /api/rooms/:id` - requireAssistant
- ✅ `DELETE /api/rooms/:id` - requireAssistant
- ✅ `POST /api/classes` - requireAssistant
- ✅ `PUT /api/classes/:id` - requireAssistant
- ✅ `DELETE /api/classes/:id` - requireAssistant

### Schedule Management
- ✅ `POST /api/schedules` - requireAssistant
- ✅ `PUT /api/schedules/:id` - requireAssistant
- ✅ `DELETE /api/schedules/:id` - requireAssistant

### Request Handling
- ✅ `PUT /api/requests/:id` - requireAssistant

### Notifications
- ✅ `POST /api/notifications` - requireAssistant (Assistant có thể gửi thông báo)
- ✅ `GET /api/notifications` - requireAuth (Mọi user đã đăng nhập có thể xem)

## 📋 Checklist hoàn thành

- [x] Tạo middleware `requireAssistant`
- [x] Tạo middleware `requireAuth`
- [x] Bảo vệ routes Subjects (POST, PUT, DELETE)
- [x] Bảo vệ routes Rooms (POST, PUT, DELETE)
- [x] Bảo vệ routes Classes (POST, PUT, DELETE)
- [x] Bảo vệ routes Schedules (POST, PUT, DELETE)
- [x] Bảo vệ routes Requests (PUT - approve/decline)
- [x] Bảo vệ routes Notifications (POST)
- [x] Thêm comment cho routes không thuộc use case Assistant
- [ ] TODO: Thêm endpoint import schedule từ Excel
- [ ] TODO: Thêm endpoint analytics dashboard

## 🚀 Sử dụng

Tất cả các routes quan trọng đã được bảo vệ bằng middleware. Khi gọi API, cần gửi header:
```
x-user-id: <user-id>
```

**Ví dụ:**
```bash
# Tạo môn học mới (cần Assistant role)
POST /api/subjects
Headers:
  x-user-id: assistant-user-id
  Content-Type: application/json
Body:
{
  "id": "CS101",
  "name": "Introduction to Computer Science",
  "credits": 3,
  "faculty": "Computer Science"
}

# Xem danh sách môn học (không cần Assistant)
GET /api/subjects
```

## 📌 Lưu ý

1. **GET routes** thường là public để xem dữ liệu, chỉ POST/PUT/DELETE mới yêu cầu Assistant
2. Các routes GradeItems, Attendance, GradeRecords không thuộc use case Assistant
3. Cần implement thêm:
   - Import schedule từ Excel
   - Analytics dashboard endpoint
4. Middleware hiện tại kiểm tra role qua header `x-user-id`, trong production nên dùng JWT token














