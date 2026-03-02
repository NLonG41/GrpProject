# Giải thích về "Handle Requests" trong hệ thống

## 📋 Tổng quan

Theo Use Case Diagram, **"Handle Requests"** là một use case quan trọng của Assistant, bao gồm:
- **Approve or decline Request**: Assistant có thể phê duyệt hoặc từ chối các yêu cầu từ người dùng

## 🔄 Luồng hoạt động

### 1. **Tạo Request** (Bởi Lecturer/Student)
Người dùng tạo request với các thông tin:
- `senderId`: ID của người gửi
- `type`: Loại request
  - `REQ_LEAVE`: Yêu cầu nghỉ học
  - `REQ_MAKEUP`: Yêu cầu học bù
- `payload`: Dữ liệu chi tiết (JSON) - có thể chứa:
  - Lý do nghỉ
  - Ngày nghỉ
  - Lớp học liên quan
  - Thông tin khác...

**Endpoint:** `POST /api/requests`

**Ví dụ:**
```json
{
  "senderId": "lecturer-123",
  "type": "REQ_LEAVE",
  "payload": {
    "reason": "Bị ốm",
    "date": "2024-01-15",
    "classId": "CS101-A",
    "note": "Sẽ có người thay thế"
  }
}
```

### 2. **Xem danh sách Requests** (Assistant)
Assistant có thể xem tất cả requests với các filter:
- `status`: PENDING, APPROVED, REJECTED
- `type`: REQ_LEAVE, REQ_MAKEUP
- `senderId`: Lọc theo người gửi

**Endpoint:** `GET /api/requests?status=PENDING`

### 3. **Xem chi tiết Request** (Assistant)
Assistant xem chi tiết một request cụ thể

**Endpoint:** `GET /api/requests/:id`

### 4. **Approve/Decline Request** (Assistant only) ⭐
Đây là chức năng chính của "Handle Requests":

**Endpoint:** `PUT /api/requests/:id`

**Body:**
```json
{
  "status": "APPROVED",  // hoặc "REJECTED"
  "adminNote": "Đã phê duyệt. Vui lòng liên hệ phòng đào tạo để sắp xếp lớp học bù."
}
```

**Quy trình:**
1. Assistant xem danh sách requests có status = PENDING
2. Assistant xem chi tiết request
3. Assistant quyết định:
   - **APPROVED**: Phê duyệt request
   - **REJECTED**: Từ chối request
4. Assistant có thể thêm `adminNote` để giải thích lý do

## 📊 Cấu trúc Request trong Database

```prisma
model Request {
  id         String        @id @default(uuid())
  senderId   String        // ID người gửi
  type       RequestType   // REQ_LEAVE hoặc REQ_MAKEUP
  status     RequestStatus // PENDING, APPROVED, REJECTED
  payload    Json          // Dữ liệu chi tiết (JSON)
  adminNote  String?       // Ghi chú từ Assistant
  createdAt  DateTime
  updatedAt  DateTime
  sender     User          // Thông tin người gửi
}
```

## 🔐 Phân quyền

- **Tạo Request**: Bất kỳ user nào (Lecturer, Student)
- **Xem Requests**: Bất kỳ user nào đã đăng nhập
- **Approve/Decline**: **CHỈ Assistant** (có middleware `requireAssistant`)

## 💡 Ví dụ sử dụng

### Scenario 1: Lecturer xin nghỉ
```bash
# 1. Lecturer tạo request
POST /api/requests
{
  "senderId": "lecturer-123",
  "type": "REQ_LEAVE",
  "payload": {
    "reason": "Bị ốm",
    "date": "2024-01-15",
    "classes": ["CS101-A", "CS102-B"]
  }
}

# 2. Assistant xem danh sách pending
GET /api/requests?status=PENDING

# 3. Assistant phê duyệt
PUT /api/requests/{request-id}
Headers: x-user-id: assistant-456
{
  "status": "APPROVED",
  "adminNote": "Đã phê duyệt. Đã sắp xếp người thay thế."
}
```

### Scenario 2: Student xin học bù
```bash
# 1. Student tạo request
POST /api/requests
{
  "senderId": "student-789",
  "type": "REQ_MAKEUP",
  "payload": {
    "reason": "Có việc gia đình",
    "missedClassId": "CS101-A",
    "preferredDates": ["2024-01-20", "2024-01-22"]
  }
}

# 2. Assistant từ chối
PUT /api/requests/{request-id}
Headers: x-user-id: assistant-456
{
  "status": "REJECTED",
  "adminNote": "Không thể sắp xếp lớp học bù trong thời gian yêu cầu."
}
```

## 📝 Các API Endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/api/requests` | Lấy danh sách requests | Public |
| GET | `/api/requests/:id` | Lấy chi tiết request | Public |
| POST | `/api/requests` | Tạo request mới | Public |
| PUT | `/api/requests/:id` | **Approve/Decline** request | **Assistant only** |
| DELETE | `/api/requests/:id` | Xóa request | Public |

## ✅ Checklist cho Assistant

Khi handle một request, Assistant cần:
1. ✅ Xem danh sách requests PENDING
2. ✅ Xem chi tiết request (payload, sender info)
3. ✅ Quyết định APPROVE hoặc REJECT
4. ✅ Thêm adminNote giải thích lý do
5. ✅ Cập nhật status

## 🎯 Tóm tắt

**"Handle Requests"** cho phép Assistant:
- Xem tất cả các yêu cầu từ Lecturer/Student
- Phê duyệt hoặc từ chối các yêu cầu
- Thêm ghi chú giải thích quyết định
- Quản lý các yêu cầu nghỉ học và học bù

Đây là một chức năng quan trọng trong quản lý học vụ, giúp Assistant xử lý các yêu cầu một cách có hệ thống và minh bạch.















