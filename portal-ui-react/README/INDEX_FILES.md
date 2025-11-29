# Index Files và Import Guide

## Tổng quan cấu trúc

```
portal-ui-react/
├── src/
│   ├── app/                    # App-level
│   │   ├── App.tsx            # Main app với routing
│   │   └── styles/
│   │       └── index.css      # Global styles
│   │
│   ├── features/               # Feature Slices
│   │   ├── auth/
│   │   │   ├── index.ts       # ✅ Public API exports
│   │   │   ├── repository/
│   │   │   │   └── authRepository.ts
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── ui/
│   │   │       └── LoginPage.tsx
│   │   │
│   │   ├── assistant/
│   │   │   ├── index.ts        # ✅ Public API exports
│   │   │   ├── repository/    # ✅ 5 repositories
│   │   │   ├── hooks/         # ✅ 5 hooks
│   │   │   ├── components/    # ✅ 6 components
│   │   │   └── ui/
│   │   │       └── AssistantPortal.tsx
│   │   │
│   │   ├── student/
│   │   │   ├── index.ts       # ✅ Public API exports
│   │   │   ├── hooks/         # ✅ 3 hooks
│   │   │   └── ui/
│   │   │       └── StudentPortal.tsx
│   │   │
│   │   └── lecturer/
│   │       ├── index.ts       # ✅ Public API exports
│   │       ├── hooks/
│   │       │   └── useLecturerData.ts
│   │       └── ui/
│   │           └── LecturerPortal.tsx
│   │
│   └── shared/                # Shared code
│       ├── index.ts           # ✅ Public API exports
│       ├── api/
│       │   └── client.ts     # ✅ Full TypeScript API client
│       ├── store/
│       │   └── authStore.ts  # ✅ Zustand store
│       ├── components/
│       │   └── ProtectedRoute.tsx
│       └── config/
│           └── firebase.ts
│
├── public/
│   └── assets/
│       └── usth-logo.png     # Copy from portal-ui/assets/
│
└── main.tsx                  # Entry point
```

## Index Files (Public API)

### ✅ `src/features/auth/index.ts`
```typescript
export { LoginPage } from './ui/LoginPage'
export { useAuth } from './hooks/useAuth'
export { authRepository } from './repository/authRepository'
```

### ✅ `src/features/assistant/index.ts`
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

### ✅ `src/features/student/index.ts`
```typescript
export { StudentPortal } from './ui/StudentPortal'
export { useStudentData } from './hooks/useStudentData'
export { useNotifications } from './hooks/useNotifications'
export { useRoomStatus } from './hooks/useRoomStatus'
```

### ✅ `src/features/lecturer/index.ts`
```typescript
export { LecturerPortal } from './ui/LecturerPortal'
export { useLecturerData } from './hooks/useLecturerData'
```

### ✅ `src/shared/index.ts`
```typescript
export { api, ApiError } from './api/client'
export { useAuthStore } from './store/authStore'
export type { User } from './store/authStore'
export { ProtectedRoute } from './components/ProtectedRoute'
export { db, app, analytics } from './config/firebase'
```

## Cách Import

### ✅ Đúng - Import từ index
```typescript
// Features
import { LoginPage, useAuth } from '@/features/auth'
import { AssistantPortal, useUsers } from '@/features/assistant'
import { StudentPortal } from '@/features/student'
import { LecturerPortal } from '@/features/lecturer'

// Shared
import { api, useAuthStore, ProtectedRoute } from '@/shared'
import type { User } from '@/shared'
```

### ❌ Sai - Import trực tiếp
```typescript
// ❌ Không import trực tiếp từ file internal
import { LoginPage } from '@/features/auth/ui/LoginPage'
import { useAuth } from '@/features/auth/hooks/useAuth'
```

## Tất cả Files đã tạo

### Core Setup (9 files)
1. `package.json` - Dependencies
2. `tsconfig.json` - TypeScript config
3. `tsconfig.node.json` - Node TypeScript config
4. `vite.config.ts` - Vite config với path aliases
5. `tailwind.config.js` - Tailwind config
6. `postcss.config.js` - PostCSS config
7. `index.html` - HTML entry
8. `src/main.tsx` - React entry point
9. `src/vite-env.d.ts` - Vite types

### App Level (2 files)
10. `src/app/App.tsx` - Main app với routing
11. `src/app/styles/index.css` - Global styles

### Shared (6 files)
12. `src/shared/index.ts` - Public API
13. `src/shared/api/client.ts` - API client với types
14. `src/shared/store/authStore.ts` - Zustand store
15. `src/shared/components/ProtectedRoute.tsx` - Route guard
16. `src/shared/config/firebase.ts` - Firebase config
17. `src/shared/assets/usth-logo.png` - Logo placeholder

### Auth Feature (4 files)
18. `src/features/auth/index.ts` - Public API
19. `src/features/auth/repository/authRepository.ts` - Data access
20. `src/features/auth/hooks/useAuth.ts` - Business logic
21. `src/features/auth/ui/LoginPage.tsx` - UI component

### Assistant Feature (17 files)
22. `src/features/assistant/index.ts` - Public API
23. `src/features/assistant/ui/AssistantPortal.tsx` - Main portal
24. `src/features/assistant/repository/usersRepository.ts`
25. `src/features/assistant/repository/subjectsRepository.ts`
26. `src/features/assistant/repository/classesRepository.ts`
27. `src/features/assistant/repository/roomsRepository.ts`
28. `src/features/assistant/repository/requestsRepository.ts`
29. `src/features/assistant/hooks/useUsers.ts`
30. `src/features/assistant/hooks/useSubjects.ts`
31. `src/features/assistant/hooks/useClasses.ts`
32. `src/features/assistant/hooks/useRooms.ts`
33. `src/features/assistant/hooks/useRequests.ts`
34. `src/features/assistant/components/UserManagement.tsx`
35. `src/features/assistant/components/SemesterManagement.tsx`
36. `src/features/assistant/components/SubjectManager.tsx`
37. `src/features/assistant/components/RoomTable.tsx`
38. `src/features/assistant/components/SchedulingBoard.tsx`
39. `src/features/assistant/components/RequestSection.tsx`

### Student Feature (5 files)
40. `src/features/student/index.ts` - Public API
41. `src/features/student/ui/StudentPortal.tsx` - Main portal
42. `src/features/student/hooks/useStudentData.ts`
43. `src/features/student/hooks/useNotifications.ts`
44. `src/features/student/hooks/useRoomStatus.ts`

### Lecturer Feature (3 files)
45. `src/features/lecturer/index.ts` - Public API
46. `src/features/lecturer/ui/LecturerPortal.tsx` - Main portal
47. `src/features/lecturer/hooks/useLecturerData.ts`

### Documentation (3 files)
48. `README.md` - Setup guide
49. `REFACTORING_GUIDE.md` - Refactoring guide
50. `INDEX_FILES.md` - This file

**Tổng cộng: 50 files**

## TypeScript Types

Tất cả types được định nghĩa trong:
- `shared/api/client.ts` - API request/response types
- `shared/store/authStore.ts` - User type
- Mỗi feature có thể extend types trong `types/` folder (nếu cần)

## Path Aliases

Đã config trong `vite.config.ts` và `tsconfig.json`:
- `@/*` → `./src/*`
- `@/features/*` → `./src/features/*`
- `@/shared/*` → `./src/shared/*`
- `@/app/*` → `./src/app/*`

## Next Steps

1. Copy logo: `cp ../portal-ui/assets/usth-logo.png ./public/assets/`
2. Install dependencies: `npm install`
3. Run dev: `npm run dev`
4. Test tất cả features
5. Implement các components còn thiếu (SemesterManagement, SchedulingBoard)

