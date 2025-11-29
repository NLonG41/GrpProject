# 🔥 Vai Trò Của Firestore Trong Hệ Thống

## 📊 Tổng Quan

Hệ thống sử dụng **2 database** với vai trò khác nhau:

### 1. **PostgreSQL (Core DB)** - Source of Truth
- **Vai trò**: Database chính, lưu trữ toàn bộ master data
- **Dữ liệu**: Users, Subjects, Classes, Enrollments, Schedules, Notifications, Requests
- **Đặc điểm**: 
  - ACID transactions
  - Relational data với foreign keys
  - Dữ liệu persistent, lâu dài
  - Cần ERD đầy đủ ✅

### 2. **Firestore (Realtime Cache)** - Real-time Layer
- **Vai trò**: Cache real-time, chỉ lưu dữ liệu cần update tức thời
- **Dữ liệu**: 
  - `live_rooms/{roomId}` - Trạng thái phòng real-time
  - `notifications/{notificationId}` - Thông báo cho students
- **Đặc điểm**:
  - NoSQL document store
  - Real-time subscriptions (WebSocket-like)
  - Dữ liệu ephemeral (có thể rebuild từ PostgreSQL)
  - **KHÔNG cần ERD riêng** ❌ (chỉ cần document structure)

---

## 🎯 Công Dụng Cụ Thể Của Firestore

### 1. **Live Room Status** (`live_rooms/{roomId}`)

**Mục đích**: Hiển thị trạng thái phòng real-time cho Student Portal

**Flow**:
```
1. Assistant tạo schedule → PostgreSQL (ClassSchedule)
2. Service A emit event → Service B (realtime)
3. Service B update Firestore: live_rooms/R101
4. Student Portal subscribe → UI update ngay lập tức (không cần refresh)
```

**Document Structure**:
```typescript
{
  roomId: "R101",
  currentStatus: "occupied" | "available",
  lastUpdated: Timestamp,
  currentClassId: string | null,
  occupiedUntil: Date | null
}
```

**Lợi ích**:
- ✅ Student thấy phòng occupied/available ngay lập tức
- ✅ Không cần polling PostgreSQL mỗi giây
- ✅ Giảm tải cho Core DB

### 2. **Notifications** (`notifications/{notificationId}`)

**Mục đích**: Push notifications real-time cho students

**Flow**:
```
1. Assistant tạo notification → Service B API
2. Service B write vào Firestore: notifications/{id}
3. Student Portal subscribe → Hiển thị notification badge ngay
```

**Document Structure**:
```typescript
{
  id: string,
  toUserId: string,
  fromUserId: string | "system",
  type: string,
  title: string,
  message: string,
  related: Record<string, any> | null,
  read: boolean,
  createdAt: Timestamp
}
```

**Lợi ích**:
- ✅ Notification xuất hiện ngay khi Assistant gửi
- ✅ Real-time badge count (số notification chưa đọc)
- ✅ Không cần refresh trang

---

## 📐 Có Cần ERD Riêng Cho Firestore Không?

### ❌ **KHÔNG CẦN ERD RIÊNG**

**Lý do**:

1. **Firestore là Denormalized Cache**
   - Dữ liệu được denormalize từ PostgreSQL
   - Không có relationships phức tạp
   - Mỗi document là self-contained

2. **Structure Đơn Giản**
   - Chỉ 2 collections chính: `live_rooms`, `notifications`
   - Không có foreign keys
   - Không có joins

3. **Source of Truth là PostgreSQL**
   - Firestore chỉ là cache layer
   - Có thể rebuild từ PostgreSQL bất cứ lúc nào
   - ERD chính nằm ở PostgreSQL (Prisma schema)

4. **Chỉ Cần Document Structure Diagram**
   - Mô tả fields của mỗi document
   - Không cần ERD với relationships

---

## 📋 Document Structure (Thay Vì ERD)

### Collection: `live_rooms`
```
live_rooms/
  └── {roomId}/
      ├── roomId: string
      ├── currentStatus: "occupied" | "available"
      ├── lastUpdated: Timestamp
      ├── currentClassId: string | null
      └── occupiedUntil: Date | null
```

### Collection: `notifications`
```
notifications/
  └── {notificationId}/
      ├── id: string
      ├── toUserId: string
      ├── fromUserId: string
      ├── type: string
      ├── title: string
      ├── message: string
      ├── related: object | null
      ├── read: boolean
      └── createdAt: Timestamp
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────┐
│  PostgreSQL     │  ← Source of Truth
│  (Core DB)      │     - Master data
└────────┬────────┘     - Persistent
         │
         │ Event: room-status-change
         ▼
┌─────────────────┐
│  Service B      │  ← Realtime Service
│  (Node.js)      │     - Consume events
└────────┬────────┘     - Update Firestore
         │
         │ Write
         ▼
┌─────────────────┐
│  Firestore      │  ← Real-time Cache
│  (NoSQL)        │     - live_rooms
└────────┬────────┘     - notifications
         │
         │ Subscribe (onSnapshot)
         ▼
┌─────────────────┐
│  Student Portal │  ← React App
│  (Frontend)     │     - Real-time UI updates
└─────────────────┘
```

---

## ✅ Kết Luận

1. **PostgreSQL**: Cần ERD đầy đủ (đã có trong Prisma schema)
2. **Firestore**: Chỉ cần document structure diagram, KHÔNG cần ERD riêng
3. **Firestore** chỉ là real-time cache layer, không phải database chính
4. Tất cả master data vẫn nằm trong PostgreSQL

---

## 📝 Best Practices

1. **Firestore chỉ lưu dữ liệu cần real-time**
   - ✅ Room status (thay đổi thường xuyên)
   - ✅ Notifications (cần push ngay)
   - ❌ Users, Classes, Subjects (lưu trong PostgreSQL)

2. **Firestore có thể rebuild từ PostgreSQL**
   - Nếu Firestore bị mất data, có thể sync lại từ PostgreSQL
   - Service B có thể query PostgreSQL và rebuild Firestore

3. **Không duplicate data không cần thiết**
   - Chỉ cache những gì cần real-time
   - Tránh data inconsistency

