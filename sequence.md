# Sequence Diagrams Summary - GroupProject

Tài liệu này tổng hợp **các sequence chính** trong hệ thống (dựa trên các module route/backend hiện có), kèm giải thích ngắn gọn để đưa vào report.

---

## 1) User Registration Sequence
**Mục tiêu:** Tạo tài khoản mới (student/lecturer/assistant/admin).

**Luồng chính:**
1. Client gửi `POST /api/auth/register` với thông tin user.
2. Backend validate payload (Zod).
3. Kiểm tra trùng `email/studentCode` trong DB.
4. (Nếu có Firebase) tạo user Firebase Auth.
5. Tạo user trong PostgreSQL (password hash SHA-256).
6. Trả `201 Created` + user info.

**Giải thích:**
- Luồng này đảm bảo dữ liệu đầu vào hợp lệ và tránh trùng tài khoản.
- Có thiết kế fallback: Firebase lỗi vẫn có thể tiếp tục tạo bản ghi DB (tùy logic hiện tại).

---

## 2) Login Sequence (Email/Password)
**Mục tiêu:** Đăng nhập bằng tài khoản nội bộ.

**Luồng chính:**
1. Client gửi `POST /api/auth/login`.
2. Backend validate input.
3. Tìm user theo email trong DB.
4. Verify password hash.
5. Trả thông tin user nếu hợp lệ (`200`), sai trả `401`.

**Giải thích:**
- Đây là luồng auth cơ bản cho web portal.
- Không hợp lệ thì trả lỗi rõ ràng để frontend hiển thị thông báo đúng.

---

## 3) Firebase Login Sequence
**Mục tiêu:** Đăng nhập bằng Firebase ID token.

**Luồng chính:**
1. Client gửi `POST /api/auth/firebase-login` + `idToken`.
2. Backend verify token bằng Firebase Admin SDK.
3. Lấy email từ token, tìm user tương ứng trong DB.
4. Trả user profile nếu tồn tại.

**Giải thích:**
- Luồng này tách xác thực (Firebase) và ủy quyền dữ liệu hệ thống (DB local).
- Nếu token hết hạn/không hợp lệ thì trả `401`.

---

## 4) Subject Management Sequence (Create/Update/Delete)
**Mục tiêu:** Trợ lý đào tạo quản lý học phần.

**Luồng chính (Create):**
1. Assistant gửi `POST /api/subjects`.
2. Middleware kiểm tra role Assistant.
3. Validate payload.
4. Check trùng `subjectId`.
5. Tạo subject trong DB.

**Giải thích:**
- Subject là thực thể gốc của chương trình học.
- Có ràng buộc không cho tạo trùng ID.

---

## 5) Class Creation Sequence
**Mục tiêu:** Mở lớp học phần theo kỳ.

**Luồng chính:**
1. Assistant gửi `POST /api/classes`.
2. Middleware auth/role check.
3. Validate dữ liệu lớp (`subjectId`, `lecturerId`, date range, capacity).
4. Verify subject tồn tại.
5. Verify lecturer tồn tại và có role `LECTURER`.
6. Check trùng `classId`.
7. Tạo class trong DB.

**Giải thích:**
- Luồng này tạo “instance” triển khai thực tế của môn học.
- Chặn dữ liệu sai nghiệp vụ ngay từ backend.

---

## 6) Recurring Schedule Creation Sequence
**Mục tiêu:** Tạo lịch học 1 lần hoặc lặp (daily/weekly/monthly/selected weekdays).

**Luồng chính:**
1. Assistant gửi `POST /api/schedules`.
2. Middleware role Assistant.
3. Validate dữ liệu thời gian + repeat settings.
4. Verify class và room tồn tại.
5. Sinh danh sách candidate sessions theo rule lặp.
6. Check conflict phòng cho từng candidate.
7. Nếu không conflict, tạo toàn bộ bằng transaction.
8. Emit realtime event cập nhật trạng thái phòng.
9. Trả về 1 schedule hoặc list schedules đã tạo.

**Giải thích:**
- Đây chính là sequence “tạo lịch học” bạn hỏi ở trên.
- Điểm quan trọng: xử lý timezone VN + conflict check + tạo atomic nhiều buổi.

---

## 7) Room Availability Check Sequence
**Mục tiêu:** Kiểm tra phòng có bị trùng lịch trong time range hay không.

**Luồng chính:**
1. Client gọi `GET /api/rooms/:id/availability?startTime&endTime...`.
2. Backend validate tham số thời gian.
3. Tìm các schedule ACTIVE giao nhau thời gian trong cùng room.
4. Trả `isAvailable` và thông tin lịch xung đột (nếu có).

**Giải thích:**
- Sequence này phục vụ UX (cảnh báo sớm trước khi tạo/cập nhật lịch).
- Quy tắc overlap được kiểm tra ở backend để đảm bảo nhất quán.

---

## 8) Enrollment Creation Sequence
**Mục tiêu:** Đăng ký sinh viên vào lớp.

**Luồng chính:**
1. Client gửi `POST /api/enrollments` (`studentId`, `classId`).
2. Backend validate payload.
3. Verify student tồn tại và role = `STUDENT`.
4. Verify class tồn tại + active.
5. Check capacity (class full hay chưa).
6. Check duplicate enrollment.
7. Transaction: tạo enrollment + tăng `currentEnrollment`.
8. Trả enrollment chi tiết.

**Giải thích:**
- Sequence này đảm bảo tính nhất quán sĩ số lớp.
- Dùng transaction để tránh lỗi tạo 1 phần.

---

## 9) Enrollment Deletion Sequence
**Mục tiêu:** Hủy đăng ký lớp.

**Luồng chính:**
1. Client gọi `DELETE /api/enrollments/:id`.
2. Backend tìm enrollment.
3. Xóa enrollment.
4. Giảm `currentEnrollment` của class tương ứng.
5. Trả `204 No Content`.

**Giải thích:**
- Cặp với sequence #8 để giữ dữ liệu sĩ số chính xác hai chiều (add/remove).

---

## 10) Request Submission Sequence (Leave/Makeup)
**Mục tiêu:** Lecturer/Student gửi yêu cầu nghiệp vụ.

**Luồng chính:**
1. Client gửi `POST /api/requests` với `senderId`, `type`, `payload`.
2. Backend validate.
3. Verify sender tồn tại.
4. Tạo request với trạng thái mặc định `PENDING`.
5. Trả request đã tạo.

**Giải thích:**
- Đây là điểm vào của workflow xử lý yêu cầu.
- Dữ liệu payload linh hoạt theo từng loại request.

---

## 11) Request Approval/Rejection Sequence
**Mục tiêu:** Assistant duyệt/từ chối yêu cầu.

**Luồng chính:**
1. Assistant gọi `PUT /api/requests/:id`.
2. Middleware check quyền Assistant.
3. Validate trạng thái mới (`APPROVED/REJECTED`) + `adminNote`.
4. Cập nhật request trong DB.
5. Trả request sau cập nhật.

**Giải thích:**
- Đây là sequence xử lý chính cho nghiệp vụ “đơn từ”.
- Có thể mở rộng thêm bước tạo notification tự động.

---

## 12) Notification Read Sequence
**Mục tiêu:** Đánh dấu thông báo đã đọc/chưa đọc.

**Luồng chính:**
1. Client gọi `PUT /api/notifications/:id` với `read=true/false`.
2. Backend validate.
3. Cập nhật trạng thái notification.
4. Trả notification mới.

**Giải thích:**
- Sequence nhỏ nhưng quan trọng cho UX realtime và quản lý inbox.

---

## 13) Dashboard Analytics Sequence
**Mục tiêu:** Lấy số liệu tổng hợp dashboard cho assistant.

**Luồng chính:**
1. Assistant gọi `GET /api/analytics/dashboard`.
2. Middleware check quyền.
3. Backend chạy nhiều nhóm truy vấn thống kê (users, subjects, classes, enrollments, requests, schedules).
4. Gom dữ liệu thành 1 JSON response.
5. Trả về frontend để render cards/charts.

**Giải thích:**
- Sequence dạng read-heavy, nhiều truy vấn tổng hợp.
- Có cơ chế safe-query/fallback để một phần lỗi không làm hỏng toàn bộ dashboard.

---

## 14) Subject Prerequisite Management Sequence
**Mục tiêu:** Quản lý quan hệ môn tiên quyết.

**Luồng chính (Create):**
1. Client gửi `POST /api/subject-prerequisites`.
2. Backend validate `subjectId/prerequisiteId`.
3. Chặn tự phụ thuộc (`subjectId === prerequisiteId`).
4. Verify cả 2 subject tồn tại.
5. Check trùng quan hệ và check vòng lặp cơ bản.
6. Tạo quan hệ prerequisite.

**Giải thích:**
- Sequence này đảm bảo đồ thị tiên quyết không bị lỗi logic cơ bản.

---

## 15) User Admin Management Sequence
**Mục tiêu:** Admin/assistant quản lý người dùng và phân quyền.

**Luồng chính:**
- Tạo user: `POST /api/users`
- Cập nhật role: `PATCH /api/users/:id/role`
- Reset password: `POST /api/users/:id/reset-password`

**Giải thích:**
- Đây là nhóm sequence vận hành hệ thống.
- Liên quan trực tiếp đến bảo mật và quyền truy cập, nên cần kiểm soát role chặt.

---

## Gợi ý chọn sequence để vẽ vào report (tránh trùng)
Nếu report đã có Enrollment, bạn nên ưu tiên các sequence khác để đa dạng:
1. **Recurring Schedule Creation** (đậm chất xử lý nghiệp vụ + conflict + timezone)
2. **Request Approval/Rejection** (workflow phê duyệt)
3. **Dashboard Analytics** (truy vấn tổng hợp nhiều nguồn)
4. **Room Availability Check** (logic overlap rõ ràng, dễ phản biện)

> Khuyến nghị: đưa 2-3 sequence tiêu biểu, mỗi cái đại diện một kiểu xử lý khác nhau (CRUD + workflow + analytics).
