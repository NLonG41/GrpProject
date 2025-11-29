# USTH Portal UI - React + TypeScript

Refactored version của portal UI sử dụng React, TypeScript, và Feature Slices pattern.

## 🚀 Quick Start

```bash
# 1. Copy logo
cp ../portal-ui/assets/usth-logo.png ./public/assets/

# 2. Install dependencies
npm install

# 3. Create .env file
echo "VITE_CORE_API=http://localhost:4000" > .env
echo "VITE_REALTIME_API=http://localhost:5002" >> .env

# 4. Run development server
npm run dev
```

App sẽ chạy tại `http://localhost:5173`

## 📁 Cấu trúc

```
src/
├── app/              # App-level config (routing, styles)
├── features/         # Feature Slices
│   ├── auth/        # Authentication
│   ├── assistant/    # Assistant/Admin portal
│   ├── student/      # Student portal
│   └── lecturer/     # Lecturer portal
└── shared/           # Shared code
    ├── api/         # API client
    ├── store/       # Zustand stores
    ├── components/  # Shared components
    └── config/      # Config (Firebase, etc.)
```

## 📚 Documentation

Tất cả documentation trong thư mục `README/`:
- `SETUP_INSTRUCTIONS.md` - Hướng dẫn setup chi tiết
- `REFACTORING_GUIDE.md` - Hướng dẫn refactoring
- `INDEX_FILES.md` - Danh sách tất cả files và exports
- `EXPORTS_INDEX.md` - Import/export guide
- `COMPLETE_REFACTOR_SUMMARY.md` - Tổng hợp refactoring
- `FINAL_CHECKLIST.md` - Checklist hoàn thành

## 🏗️ Feature Slices Pattern

Mỗi feature có cấu trúc:
- `repository/` - Data access layer
- `hooks/` - Business logic (custom hooks)
- `ui/` - React components
- `index.ts` - Public API exports

## 📦 Scripts

- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## 🔗 Import Pattern

```typescript
// ✅ Đúng - Import từ index
import { LoginPage, useAuth } from '@/features/auth'
import { AssistantPortal, useUsers } from '@/features/assistant'
import { api, useAuthStore } from '@/shared'
```

## 🎯 Features

- ✅ Authentication (Login, Register, Forgot Password)
- ✅ User Management (Admin/Assistant only)
- ✅ Subject Management
- ✅ Class Management
- ✅ Room Management
- ✅ Request Management
- ✅ Real-time sync với Firebase
- ✅ Role-based routing

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Firebase** - Real-time sync
