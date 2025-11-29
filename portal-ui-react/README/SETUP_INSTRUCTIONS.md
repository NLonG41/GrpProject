# Setup Instructions

## Bước 1: Copy Assets

```bash
# Copy logo từ portal-ui
mkdir -p public/assets
cp ../portal-ui/assets/usth-logo.png ./public/assets/
```

## Bước 2: Install Dependencies

```bash
cd portal-ui-react
npm install
```

## Bước 3: Setup Environment

Tạo file `.env`:
```env
VITE_CORE_API=http://localhost:4000
VITE_REALTIME_API=http://localhost:5002
```

## Bước 4: Run Development Server

```bash
npm run dev
```

App sẽ chạy tại `http://localhost:5173`

## Bước 5: Test

1. Login với admin: `admin@usth.edu.vn` / `admin123`
2. Test các features:
   - User Management
   - Subjects, Classes, Rooms
   - Requests

## Troubleshooting

### Lỗi import
- Đảm bảo import từ index files: `@/features/auth` không phải `@/features/auth/ui/LoginPage`
- Check path aliases trong `vite.config.ts`

### Lỗi TypeScript
- Run `npm run build` để check types
- Đảm bảo tất cả types được export đúng

### Lỗi Firebase
- Check Firebase config trong `shared/config/firebase.ts`
- Đảm bảo Firebase project đã setup

