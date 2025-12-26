# 🧪 Hướng dẫn Test API

## Cách 1: Dùng file `.http` (VS Code REST Client)

1. Cài extension **REST Client** trong VS Code
2. Mở file `test-api.http`
3. Click vào "Send Request" phía trên mỗi request

## Cách 2: Dùng PowerShell Script (Windows)

```powershell
.\test-api.ps1
```

## Cách 3: Dùng Bash Script (Linux/Mac)

```bash
chmod +x test-api.sh
./test-api.sh
```

## Cách 4: Dùng curl (Manual)

### Health Check
```bash
curl http://localhost:5001/health
```

### Get All Users
```bash
curl http://localhost:5001/api/users
```

### Register User
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@usth.edu.vn",
    "password": "test123456",
    "role": "ASSISTANT"
  }'
```

### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@usth.edu.vn",
    "password": "test123456"
  }'
```

### Get Users by Role
```bash
curl http://localhost:5001/api/users?role=ASSISTANT
```

### Create User (Requires Admin/Assistant)
```bash
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "fullName": "New Student",
    "email": "student001@usth.edu.vn",
    "role": "STUDENT",
    "studentCode": "CS2022001",
    "cohort": "2022",
    "major": "CS"
  }'
```

## Cách 5: Dùng Postman

1. Import collection từ file `test-api.http` (nếu Postman hỗ trợ)
2. Hoặc tạo requests thủ công theo các endpoint trong file `.http`

## Endpoints có sẵn

### Auth
- `GET /health` - Health check
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập (password-based)
- `POST /api/auth/firebase-login` - Đăng nhập (Firebase token)

### Users
- `GET /api/users` - Lấy tất cả users
- `GET /api/users?role=ASSISTANT` - Lọc theo role
- `GET /api/users/:identifier` - Lấy user theo ID/email/studentCode
- `POST /api/users` - Tạo user (cần Admin/Assistant)
- `PATCH /api/users/:id/role` - Đổi role (cần Admin/Assistant)

### Subjects, Rooms, Classes, Requests
- `GET /api/subjects` - Lấy tất cả môn học
- `GET /api/rooms` - Lấy tất cả phòng
- `GET /api/classes` - Lấy tất cả lớp học
- `GET /api/requests` - Lấy tất cả requests

## Lưu ý

- Đảm bảo core service đang chạy: `cd services/core && npm run dev`
- Port mặc định: `5001`
- Một số endpoints cần header `x-user-id` (tạm thời, sẽ thay bằng JWT sau)

