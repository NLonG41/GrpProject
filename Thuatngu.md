# Thuật ngữ dự án (Glossary)

Tài liệu này tổng hợp các thuật ngữ quan trọng xuất hiện trong đồ án, đặc biệt phần Web + Backend.

---

## A

### API (Application Programming Interface)
Giao diện để các hệ thống giao tiếp với nhau. Trong dự án, frontend gọi API backend qua HTTP như `GET /api/subjects`, `POST /api/schedules`.

### Atomicity (Tính nguyên tử)
Tính chất của transaction: hoặc tất cả bước thành công, hoặc rollback toàn bộ nếu có lỗi.

### Authentication
Xác thực người dùng (kiểm tra “bạn là ai”), ví dụ login bằng email/password hoặc Firebase token.

### Authorization
Phân quyền (kiểm tra “bạn được làm gì”), ví dụ chỉ `ASSISTANT` mới được tạo lịch.

---

## B

### Backend
Phần xử lý nghiệp vụ phía server (Express + Prisma), chịu trách nhiệm validate, kiểm tra rule, đọc/ghi DB.

### Business Rule
Luật nghiệp vụ do hệ thống áp dụng, ví dụ:
- Không cho trùng lịch phòng.
- Không cho enroll vượt sức chứa.
- Chỉ assistant được duyệt request.

---

## C

### CORS (Cross-Origin Resource Sharing)
Cơ chế cho phép frontend domain/port khác gọi API backend, ví dụ frontend `localhost:5173` gọi backend `localhost:4000`.

### CRUD
4 thao tác dữ liệu cơ bản:
- Create
- Read
- Update
- Delete

### Conflict (409)
Lỗi xung đột nghiệp vụ. Ví dụ tạo lịch bị trùng phòng sẽ trả HTTP `409 Conflict`.

---

## D

### Database Schema
Cấu trúc dữ liệu DB: bảng, cột, kiểu dữ liệu, ràng buộc, quan hệ.

### DTO (Data Transfer Object)
Cấu trúc dữ liệu trao đổi giữa client và server (thường là JSON payload).

---

## E

### Endpoint
Đường dẫn API cụ thể, ví dụ `PUT /api/requests/:id`.

### Enum
Kiểu dữ liệu tập giá trị cố định, ví dụ:
- `ScheduleType`: `MAIN`, `MAKEUP`, `EXAM`
- `ScheduleCategory`: `STUDY`, `EXAM`

---

## F

### Firebase Auth
Dịch vụ xác thực người dùng của Firebase. Dự án dùng để verify ID token.

### Firestore
NoSQL database của Firebase, dự án dùng cho notification/realtime data.

### Frontend
Phần giao diện người dùng (React + TypeScript).

---

## G

### Gateway (khái niệm)
Điểm vào tập trung cho request. Dự án hiện tại chưa tách gateway riêng mạnh, nhưng middleware auth đóng vai trò kiểm soát đầu vào.

---

## H

### HTTP Status Code
Mã phản hồi HTTP:
- `200`: Thành công
- `201`: Tạo mới thành công
- `204`: Thành công, không có body
- `400`: Input sai
- `401`: Chưa xác thực
- `403`: Không đủ quyền
- `404`: Không tìm thấy
- `409`: Xung đột nghiệp vụ
- `500`: Lỗi hệ thống

---

## I

### Index (Database Index)
Cấu trúc giúp query nhanh hơn. Ví dụ nên index theo `roomId`, `startTime`, `endTime` để check conflict lịch.

---

## J

### JSON
Định dạng dữ liệu trao đổi giữa frontend/backend.

### JWT (JSON Web Token)
Token dùng cho auth. Trong production thường verify JWT để thay cho trust header thủ công.

---

## M

### Middleware
Lớp xử lý trung gian trước khi vào handler chính của route. Ví dụ `requireAssistant` kiểm tra quyền role.

### Migration
Tập lệnh thay đổi schema DB theo version (thêm cột, sửa bảng...).
Ví dụ dự án có migration thêm cột `category` vào `class_schedule` để phân biệt lịch học/lịch thi.

### Monolith
Kiến trúc 1 khối duy nhất. Dự án của bạn không hoàn toàn monolith vì đã tách core/realtime.

---

## N

### Neon (Neon PostgreSQL)
Dịch vụ PostgreSQL serverless bạn đang dùng làm DB chính.

### Normalization
Chuẩn hóa dữ liệu quan hệ để giảm trùng lặp, tăng nhất quán.

---

## O

### ORM (Object-Relational Mapping)
Công cụ ánh xạ object code sang bảng DB. Prisma là ORM trong dự án.

### Observability
Khả năng quan sát hệ thống qua logs/metrics/traces để phát hiện và chẩn đoán lỗi.

### Overlap (Time Overlap)
Điều kiện thời gian giao nhau để phát hiện trùng lịch phòng:
- `existing.start < new.end`
- `existing.end > new.start`

---

## P

### Polling
Cơ chế frontend gọi API định kỳ (ví dụ mỗi 30 giây) để cập nhật dữ liệu mới.

### Prisma
ORM cho Node.js/TypeScript.
Trong dự án, Prisma dùng để:
- Định nghĩa schema (`schema.prisma`)
- Generate type-safe client
- Query DB bằng code TypeScript

### Prisma Client
Code được generate từ Prisma schema để thao tác DB (findMany, create, update, transaction...).

### Prisma Error `P2022`
Lỗi thường gặp khi schema drift: code query field mà DB thực tế chưa có cột tương ứng.

---

## Q

### Query
Câu lệnh truy vấn dữ liệu từ DB (SQL hoặc qua ORM).

---

## R

### RBAC (Role-Based Access Control)
Phân quyền theo vai trò. Ví dụ role `ASSISTANT` mới được tạo lịch/duyệt request.

### Recurring Schedule
Lịch lặp theo quy tắc (daily/weekly/monthly/chọn thứ).

### Repository Pattern
Tổ chức code tách lớp gọi API/DB ra khỏi UI logic để dễ bảo trì.

### REST API
Kiểu thiết kế API dựa trên resource + HTTP methods (GET/POST/PUT/DELETE).

---

## S

### Schema Drift
Trạng thái lệch giữa:
- Prisma schema/client
- Database thực tế
Thường gây lỗi runtime khi truy vấn.

### Sequence Diagram
Biểu đồ mô tả thứ tự tương tác giữa actor/UI/API/DB theo thời gian.

### Serverless Database
DB chạy dạng managed service, tự scale, không cần tự quản lý server vật lý.

### Soft Validation vs Hard Validation
- Soft: kiểm tra nhẹ phía frontend (UX)
- Hard: kiểm tra bắt buộc ở backend (an toàn dữ liệu)

### SQL (Structured Query Language)
Ngôn ngữ thao tác CSDL quan hệ.

### Status Badge
Nhãn trạng thái trên UI, ví dụ request `PENDING/APPROVED/REJECTED`.

---

## T

### Timezone
Múi giờ. Dự án lưu UTC trong DB và convert khi hiển thị (ví dụ GMT+7).

### Transaction
Nhóm nhiều thao tác DB thực hiện như 1 đơn vị nguyên tử.
Ví dụ tạo enrollment + tăng `currentEnrollment` trong cùng transaction.

### Type-safe
Đảm bảo kiểu dữ liệu đúng ở compile-time (TypeScript + Prisma), giảm lỗi runtime.

---

## U

### UI/UX
- UI: giao diện
- UX: trải nghiệm người dùng

### UUID
Chuỗi định danh duy nhất toàn cục, thường dùng làm ID.

---

## V

### Validation
Kiểm tra dữ liệu đầu vào đúng format/rule trước khi xử lý.

---

## Z

### Zod
Thư viện validate schema runtime cho TypeScript.
Trong dự án, Zod dùng ở backend routes để validate request payload.

---

## Thuật ngữ riêng trong dự án

### `ScheduleType`
Phân loại nghiệp vụ chi tiết của lịch:
- `MAIN`: lịch học chính
- `MAKEUP`: lịch bù
- `EXAM`: lịch thi

### `ScheduleCategory`
Phân nhóm hiển thị/tổng hợp mức cao:
- `STUDY`: lịch học
- `EXAM`: lịch thi

### `requireAssistant`
Middleware kiểm tra quyền assistant trước khi cho phép gọi API quản trị.

### `x-user-id`
Header tạm dùng để xác định user trong môi trường dev. Production nên thay bằng token verification chuẩn.
