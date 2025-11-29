# Complete Exports Index

## ✅ Tất cả Public Exports

### `src/shared/index.ts`
```typescript
export { api, ApiError } from './api/client'
export { useAuthStore } from './store/authStore'
export type { User } from './store/authStore'
export { ProtectedRoute } from './components/ProtectedRoute'
export { db, app, analytics } from './config/firebase'
```

**Types exported:**
- `User` (from authStore)
- `ApiError` (from client)
- All API types (LoginResponse, Subject, Class, Room, Request, etc.)

### `src/features/auth/index.ts`
```typescript
export { LoginPage } from './ui/LoginPage'
export { useAuth } from './hooks/useAuth'
export { authRepository } from './repository/authRepository'
```

### `src/features/assistant/index.ts`
```typescript
export { AssistantPortal } from './ui/AssistantPortal'
export { useUsers } from './hooks/useUsers'
export { useSubjects } from './hooks/useSubjects'
export { useClasses } from './hooks/useClasses'
export { useRooms } from './hooks/useRooms'
export { useRequests } from './hooks/useRequests'
export { usersRepository } from './repository/usersRepository'
export { subjectsRepository } from './repository/subjectsRepository'
export { classesRepository } from './repository/classesRepository'
export { roomsRepository } from './repository/roomsRepository'
export { requestsRepository } from './repository/requestsRepository'
```

### `src/features/student/index.ts`
```typescript
export { StudentPortal } from './ui/StudentPortal'
export { useStudentData } from './hooks/useStudentData'
export { useNotifications } from './hooks/useNotifications'
export { useRoomStatus } from './hooks/useRoomStatus'
```

### `src/features/lecturer/index.ts`
```typescript
export { LecturerPortal } from './ui/LecturerPortal'
export { useLecturerData } from './hooks/useLecturerData'
```

### `src/app/index.ts`
```typescript
export { default as App } from './App'
```

## Import Patterns

### ✅ Recommended Imports

```typescript
// App-level
import App from '@/app/App'

// Shared
import { api, useAuthStore, ProtectedRoute } from '@/shared'
import type { User, Subject, Class, Room, Request } from '@/shared/api/client'

// Features
import { LoginPage, useAuth } from '@/features/auth'
import { AssistantPortal, useUsers, useSubjects } from '@/features/assistant'
import { StudentPortal, useStudentData } from '@/features/student'
import { LecturerPortal, useLecturerData } from '@/features/lecturer'
```

## Dependency Graph

```
App.tsx
  ├─> @/features/auth (LoginPage)
  ├─> @/features/assistant (AssistantPortal)
  ├─> @/features/student (StudentPortal)
  ├─> @/features/lecturer (LecturerPortal)
  └─> @/shared (ProtectedRoute, useAuthStore)

Features
  ├─> @/shared (api, useAuthStore, types)
  └─> Internal (repository, hooks, ui)

Shared
  └─> No feature dependencies (pure shared code)
```

## Type Exports

### From `shared/api/client.ts`
- `LoginResponse`
- `User`
- `Subject`
- `Class`
- `Room`
- `Request`
- `CreateUserPayload`
- `ApiError`

### From `shared/store/authStore.ts`
- `User` (re-exported)
- `AuthState` (internal)

## Verification Checklist

- [x] Tất cả features có index.ts
- [x] Tất cả exports được liệt kê
- [x] Không có circular dependencies
- [x] Types được export đầy đủ
- [x] Path aliases hoạt động
- [x] Imports từ index files

