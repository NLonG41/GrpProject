# Feature Implementation Plan: Attendance Tracking

## Bước 1: Phân tích Codebase

### Files liên quan hiện tại:
- `services/core/prisma/schema.prisma` - Database schema
- `services/core/src/routes/` - API routes
- `portal-ui/src/api/client.js` - API client
- `portal-ui/src/services/data.js` - Data service layer

### Kiến trúc hiện tại:
- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Frontend**: Vanilla JS + Parcel
- **Pattern**: Service-based (chưa có Feature Slices)

## Bước 2: Lập kế hoạch Implementation

### Feature: Attendance Tracking System

**Mô tả**: Hệ thống điểm danh cho sinh viên, cho phép:
- Lecturer điểm danh cho lớp học
- Student xem lịch sử điểm danh
- Real-time sync qua Firebase
- Thống kê attendance rate

### Files cần tạo:

#### Backend (services/core):
1. `prisma/migrations/YYYYMMDDHHMMSS_add_attendance/migration.sql` - Migration
2. `src/routes/attendance.ts` - Attendance API routes
3. `src/lib/attendance.ts` - Attendance business logic (optional)

#### Frontend (portal-ui):
**Nếu refactor sang React:**
1. `src/features/attendance/repositories/attendanceRepository.ts` - Data access
2. `src/features/attendance/hooks/useAttendance.ts` - Business logic hook
3. `src/features/attendance/hooks/useAttendanceStats.ts` - Stats hook
4. `src/features/attendance/components/AttendanceList.tsx` - UI component
5. `src/features/attendance/components/AttendanceForm.tsx` - Form component
6. `src/features/attendance/components/AttendanceStats.tsx` - Stats component
7. `src/features/attendance/index.ts` - Public API

**Nếu giữ vanilla JS:**
1. `src/services/attendance.js` - Service layer
2. `src/utils/attendance.js` - Utilities
3. `attendance.html` - Attendance page (nếu cần)

### Files cần sửa:

#### Backend:
1. `prisma/schema.prisma` - Thêm Attendance model
2. `src/app.ts` - Thêm attendance routes
3. `src/routes/schedule.ts` - Link với attendance (optional)

#### Frontend:
1. `src/api/client.js` - Thêm attendance API methods
2. `main.js` - Thêm attendance section (nếu cần)
3. `lecturer.js` - Thêm attendance UI cho lecturer
4. `student.js` - Thêm attendance view cho student

### Dependencies cần import:

#### Backend:
- Prisma (đã có)
- Express (đã có)
- Zod (đã có) - Validation

#### Frontend:
- Firebase (đã có) - Real-time sync
- API client (đã có)

## Bước 3: Database Schema Design

### Attendance Model:
```prisma
model Attendance {
  id            String   @id @default(uuid())
  scheduleId    String
  studentId     String
  status        AttendanceStatus @default(PRESENT)
  checkInTime  DateTime?
  deviceId      String?
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  schedule      ClassSchedule @relation(fields: [scheduleId], references: [id])
  student       User          @relation(fields: [studentId], references: [id])

  @@unique([scheduleId, studentId])
  @@index([studentId])
  @@index([scheduleId])
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}
```

## Bước 4: Implementation Order

### Phase 1: Backend (Repository Layer)
1. ✅ Update Prisma schema
2. ✅ Create migration
3. ✅ Generate Prisma client
4. ✅ Create attendance routes
5. ✅ Add validation schemas
6. ✅ Test API endpoints

### Phase 2: Frontend - Repository Pattern
1. ✅ Create API client methods
2. ✅ Create data service layer
3. ✅ Add error handling

### Phase 3: Frontend - Business Logic (Hooks)
1. ✅ Create useAttendance hook
2. ✅ Create useAttendanceStats hook
3. ✅ Add real-time sync logic

### Phase 4: Frontend - UI Components
1. ✅ Create AttendanceList component
2. ✅ Create AttendanceForm component
3. ✅ Create AttendanceStats component
4. ✅ Add styling với theme

### Phase 5: Integration
1. ✅ Add routes
2. ✅ Add navigation
3. ✅ Update context providers
4. ✅ Test end-to-end

## Bước 5: Coding Standards

### TypeScript:
- Strict mode enabled
- Type safety cho tất cả functions
- Interface definitions cho API responses

### Error Handling:
- Try-catch blocks
- User-friendly error messages
- Logging cho debugging

### Naming Conventions:
- PascalCase cho components
- camelCase cho functions/variables
- UPPER_CASE cho constants
- kebab-case cho files

### Comments:
- JSDoc cho public functions
- Inline comments cho logic phức tạp

## Bước 6: Theme & Styling

### CSS Variables:
- Sử dụng từ `global.css` (nếu có)
- Dark/light theme support
- Responsive design

### Component Styling:
- Consistent spacing
- Accessible colors
- Mobile-first approach

## Bước 7: Testing Checklist

- [ ] API endpoints work correctly
- [ ] Database queries optimized
- [ ] Real-time sync works
- [ ] UI responsive trên mobile
- [ ] Error handling works
- [ ] TypeScript compilation passes
- [ ] No circular dependencies
- [ ] Performance acceptable

