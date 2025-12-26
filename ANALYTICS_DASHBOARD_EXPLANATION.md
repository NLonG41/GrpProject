# Analytics Dashboard - Giải thích và Kế hoạch

## 📊 Analytics Dashboard là gì?

Theo Use Case Diagram, **"View Analytics Dashboard"** là một use case quan trọng của Assistant, cho phép Assistant xem các dữ liệu phân tích và thống kê về hệ thống.

## 🎯 Mục đích

Analytics Dashboard giúp Assistant:
- **Theo dõi tổng quan** về hệ thống
- **Phân tích dữ liệu** để đưa ra quyết định
- **Giám sát** các hoạt động và xu hướng
- **Báo cáo** cho ban giám hiệu/quản lý

## 📈 Các chỉ số nên có trong Dashboard

### 1. **Thống kê Người dùng**
- Tổng số người dùng theo role (Admin, Assistant, Lecturer, Student)
- Số lượng người dùng mới trong tháng
- Biểu đồ phân bố theo role

### 2. **Thống kê Môn học & Lớp học**
- Tổng số môn học
- Tổng số lớp học (active/inactive)
- Tỷ lệ đăng ký lớp học (enrollment rate)
- Lớp học đầy/chưa đầy

### 3. **Thống kê Lịch học**
- Tổng số lịch học trong tuần/tháng
- Phòng học được sử dụng nhiều nhất
- Thời gian biểu trung bình

### 4. **Thống kê Requests**
- Tổng số requests (Pending/Approved/Rejected)
- Tỷ lệ phê duyệt
- Requests theo loại (REQ_LEAVE/REQ_MAKEUP)

### 5. **Thống kê Enrollments**
- Tổng số enrollments
- Lớp học có nhiều học sinh nhất
- Tỷ lệ đăng ký theo môn học

## 🚀 Kế hoạch Implementation

### Backend (API)
Cần tạo endpoint:
```
GET /api/analytics/dashboard
```

Response mẫu:
```json
{
  "users": {
    "total": 150,
    "byRole": {
      "ADMIN": 2,
      "ASSISTANT": 5,
      "LECTURER": 20,
      "STUDENT": 123
    },
    "newThisMonth": 15
  },
  "subjects": {
    "total": 45,
    "active": 40
  },
  "classes": {
    "total": 120,
    "active": 100,
    "full": 25,
    "available": 75
  },
  "enrollments": {
    "total": 850,
    "averagePerClass": 7.08
  },
  "requests": {
    "total": 50,
    "pending": 10,
    "approved": 35,
    "rejected": 5,
    "approvalRate": 87.5
  },
  "schedules": {
    "totalThisWeek": 150,
    "totalThisMonth": 600
  }
}
```

### Frontend (UI Components)
- Dashboard cards với số liệu
- Charts (bar, pie, line)
- Tables với dữ liệu chi tiết
- Filters (theo thời gian, theo khoa, etc.)

## 📝 Status hiện tại

**Status:** ⚠️ Chưa được implement
- Backend: Chưa có endpoint
- Frontend: Chỉ có placeholder "Tính năng đang được phát triển..."

## ✅ Next Steps

1. Tạo API endpoint `/api/analytics/dashboard` trong backend
2. Tạo component `AnalyticsDashboard.tsx` trong frontend
3. Thêm charts library (recharts, chart.js, etc.)
4. Implement các widgets thống kê
5. Thêm filters và date range picker

## 💡 Lợi ích

- **Decision Making**: Dữ liệu giúp đưa ra quyết định tốt hơn
- **Monitoring**: Theo dõi tình trạng hệ thống
- **Reporting**: Tạo báo cáo cho quản lý
- **Optimization**: Tối ưu hóa tài nguyên và lịch học














