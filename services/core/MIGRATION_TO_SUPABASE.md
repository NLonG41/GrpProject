# 🔄 Migration sang Supabase PostgreSQL + Firebase Auth

## Bước 1: Cấu hình Supabase Database

1. Tạo file `.env` trong `services/core/`:

```env
# Supabase PostgreSQL Connection String
DATABASE_URL=postgresql://postgres:FfoBmn5FJm4irTxE@db.ullrhadkkparypdvrqvi.supabase.co:5432/postgres

# Service Port
PORT=5001

# Event Broker (optional)
EVENT_BROKER_URL=
```

2. Chạy Prisma migrations để sync schema:

```bash
cd services/core
npx prisma migrate deploy
```

Hoặc nếu muốn tạo migration mới:

```bash
npx prisma migrate dev --name migrate_to_supabase
```

## Bước 2: Cấu hình Firebase Auth

1. Đảm bảo `services/realtime` đã có Firebase Admin config trong `.env`:

```env
FIREBASE_PROJECT_ID=web-portal-us
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@web-portal-us.iam.gserviceaccount.com
PORT=5002
```

2. Cài `firebase-admin` trong `services/core` (nếu chưa có):

```bash
cd services/core
npm install firebase-admin
```

## Bước 3: Chạy seed users (nếu cần)

```bash
npm run seed:users
```

## Bước 4: Test kết nối

1. Chạy core service:

```bash
npm run dev
```

2. Test API:

```bash
# Test health
curl http://localhost:5001/api/health

# Test database connection (sẽ trả về danh sách users)
curl http://localhost:5001/api/users
```

## Lưu ý

- **Database**: Tất cả dữ liệu hiện tại sẽ được migrate sang Supabase
- **Authentication**: Sẽ chuyển sang Firebase Auth (cần cập nhật code)
- **Notifications**: Đã dùng Firebase, không cần thay đổi

