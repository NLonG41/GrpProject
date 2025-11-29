# Refactoring Guide: Vanilla JS → React + TypeScript

## Đã hoàn thành

### ✅ Cấu trúc thư mục
- Feature Slices pattern với `features/` và `shared/`
- Repository pattern cho data access
- Custom hooks cho business logic
- React components cho UI

### ✅ Core Setup
- Vite + React + TypeScript
- Tailwind CSS
- React Router
- Zustand cho state management
- Firebase integration

### ✅ Features đã migrate
1. **Auth Feature** (`features/auth/`)
   - ✅ Repository: `authRepository.ts`
   - ✅ Hook: `useAuth.ts`
   - ✅ Component: `LoginPage.tsx`
   - ✅ Index exports

2. **Assistant Feature** (`features/assistant/`)
   - ✅ Repositories: users, subjects, classes, rooms, requests
   - ✅ Hooks: useUsers, useSubjects, useClasses, useRooms, useRequests
   - ✅ Components: UserManagement, SemesterManagement, SubjectManager, RoomTable, SchedulingBoard, RequestSection
   - ✅ Main Portal: `AssistantPortal.tsx`
   - ✅ Index exports

3. **Student Feature** (`features/student/`)
   - ✅ Hooks: useStudentData, useNotifications, useRoomStatus
   - ✅ Component: `StudentPortal.tsx`
   - ✅ Index exports

4. **Lecturer Feature** (`features/lecturer/`)
   - ✅ Hook: useLecturerData
   - ✅ Component: `LecturerPortal.tsx`
   - ✅ Index exports

### ✅ Shared Code
- ✅ API Client (`shared/api/client.ts`) - TypeScript với đầy đủ types
- ✅ Auth Store (`shared/store/authStore.ts`) - Zustand với persistence
- ✅ Protected Route (`shared/components/ProtectedRoute.tsx`)
- ✅ Firebase Config (`shared/config/firebase.ts`)
- ✅ Index exports (`shared/index.ts`)

## Cần hoàn thiện

### 🔄 Components cần implement đầy đủ
1. `SemesterManagement.tsx` - Hiện tại là placeholder
2. `SchedulingBoard.tsx` - Hiện tại là placeholder
3. Calendar component (nếu cần)

### 🔄 Features cần bổ sung
1. Real-time sync với Firebase (đã có hooks nhưng cần test)
2. Error boundaries
3. Loading states tốt hơn
4. Form validation với Zod hoặc React Hook Form

## Cách sử dụng

### Setup
```bash
cd portal-ui-react
npm install
npm run dev
```

### Copy assets
```bash
# Copy logo từ portal-ui
cp ../portal-ui/assets/usth-logo.png ./public/assets/
```

### Environment variables
Tạo file `.env`:
```
VITE_CORE_API=http://localhost:4000
VITE_REALTIME_API=http://localhost:5002
```

## Cấu trúc Import/Export

Tất cả features đều có `index.ts` để export public API:

```typescript
// ✅ Đúng - Import từ index
import { LoginPage, useAuth } from '@/features/auth'
import { useUsers, UserManagement } from '@/features/assistant'

// ❌ Sai - Import trực tiếp từ file
import { LoginPage } from '@/features/auth/ui/LoginPage'
```

## TypeScript Types

Tất cả types được định nghĩa trong:
- `shared/api/client.ts` - API types
- `shared/store/authStore.ts` - User type
- Mỗi feature có thể có types riêng trong `types/` folder

## Next Steps

1. Test tất cả features
2. Implement các components còn thiếu
3. Add error boundaries
4. Improve loading states
5. Add form validation
6. Test real-time sync

