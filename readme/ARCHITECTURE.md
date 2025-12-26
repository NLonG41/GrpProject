# USTH Portal – Current Architecture

Document này mô tả kiến trúc hiện tại của hệ thống sau khi migrate sang Neon Database.

## 1. High–Level Topology

```
┌────────────┐      ┌──────────────┐      ┌──────────────┐
│  Client    │ <--> │  Core API   │ <--> │  Neon DB     │
│ (React)    │      │ (Express)   │      │ (PostgreSQL) │
│ Port 5173  │      │ Port 4000   │      │ (Serverless) │
└────────────┘      └──────────────┘      └──────────────┘
                            │
                            │
                    ┌───────┴────────┐
                    │               │
            ┌───────▼──────┐ ┌──────▼──────────┐
            │  Realtime    │ │  Firebase Auth   │
            │  Service     │ │  (Verification)  │
            │  Port 5002   │ │                  │
            └──────────────┘ └──────────────────┘
                    │
                    │
            ┌───────▼──────────┐
            │  Firebase        │
            │  Firestore       │
            │  (Notifications) │
            └──────────────────┘
```

## 2. Components

### Frontend Layer

- **portal-ui-react** (Vite + React + TypeScript)
  - Port: `5173` (development)
  - Chỉ còn 2 modules: `assistant` và `auth`
  - UI tập trung vào Assistant Portal
  - Kết nối tới Core Service (REST API) và Realtime Service (Firebase)

### Backend Services

- **services/core** (Express + Prisma + Neon Database)
  - Port: `4000`
  - REST API chính: `/api/auth`, `/api/users`, `/api/subjects`, `/api/classes`, `/api/rooms`, `/api/schedule`, `/api/requests`
  - Database: **Neon Database** (PostgreSQL serverless)
  - Schema đầy đủ: User, Subject, Class, Room, Enrollment, Schedule, Request, Notification
  - Script seed: `npm run seed:users` để tạo 50 tài khoản mẫu

- **services/realtime** (Express + Firebase Admin)
  - Port: `5002`
  - Quản lý thông báo realtime qua Firestore
  - Endpoints: `/notifications`, `/rt/rooms/:id`

### Database

- **Neon Database** (PostgreSQL serverless)
  - Schema được quản lý bởi Prisma
  - Migrations: Chạy SQL script trong `create-tables.sql` hoặc `npx prisma migrate deploy`
  - Connection pooling tự động
  - SSL required (`sslmode=require`)
  - Region: ap-southeast-1 (Asia Pacific)

### Authentication

- **Firebase Authentication**
  - Frontend: Firebase Client SDK (`signInWithEmailAndPassword`)
  - Backend: Firebase Admin SDK (verify ID tokens)
  - Flow:
    1. User đăng nhập qua Firebase Auth (frontend)
    2. Frontend lấy ID token
    3. Frontend gửi token tới `/api/auth/firebase-login`
    4. Backend verify token và trả về user data từ Neon Database

## 3. Data Flow: Authentication

1. **Client → Firebase Auth**
   - User nhập email/password
   - Firebase Auth xác thực và trả về ID token

2. **Client → Core Service**
   - Frontend gửi ID token tới `/api/auth/firebase-login`
   - Core Service verify token với Firebase Admin SDK
   - Core Service query user từ Neon Database
   - Core Service trả về user data (role, fullName, email, etc.)

3. **Client → Realtime Service**
   - Frontend subscribe Firestore notifications
   - Realtime Service quản lý notifications collection

## 4. Data Flow: Schedule Management

1. **Client → Core Service**
   - Assistant tạo schedule: `POST /api/schedule`
   - Core Service kiểm tra conflicts trong Neon Database
   - Core Service insert vào `ClassSchedule` table

2. **Core Service → Realtime Service** (future)
   - Emit event khi schedule được tạo
   - Realtime Service update Firestore `live_rooms` collection

3. **Client**
   - Frontend subscribe Firestore để hiển thị realtime updates

## 5. Repository Layout

```
GroupProject/
├── portal-ui-react/          # Frontend (React + Vite)
│   ├── src/
│   │   ├── features/
│   │   │   ├── assistant/    # Assistant Portal UI
│   │   │   └── auth/         # Authentication UI
│   │   └── shared/
│   │       ├── api/          # API client
│   │       └── config/       # Firebase config
│   └── package.json
│
├── services/
│   ├── core/                 # Core Service (Express + Prisma)
│   │   ├── src/
│   │   │   ├── routes/       # API routes
│   │   │   ├── lib/          # Prisma client, Firebase Admin
│   │   │   └── config/       # Environment config
│   │   ├── prisma/
│   │   │   └── schema.prisma # Database schema
│   │   └── package.json
│   │
│   └── realtime/             # Realtime Service (Express + Firebase)
│       ├── src/
│       │   ├── routes/      # Notification routes
│       │   └── lib/          # Firebase Admin
│       └── package.json
│
├── create-tables.sql         # SQL script để tạo tables trong Neon
├── README.md                 # Main documentation
└── NEON_ARCHITECTURE.md     # Neon Database architecture details
```

## 6. Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Zustand (state management)
- Firebase Auth SDK

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- Firebase Admin SDK

### Database
- Neon Database (PostgreSQL serverless)
- Firebase Firestore (notifications)

### Authentication
- Firebase Authentication (frontend)
- Firebase Admin SDK (backend verification)

## 7. Environment Variables

### services/core/.env
```env
DATABASE_URL=postgresql://neondb_owner:password@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=4000
FIREBASE_PROJECT_ID=web-portal-us
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@web-portal-us.iam.gserviceaccount.com
```

### services/realtime/.env
```env
FIREBASE_PROJECT_ID=web-portal-us
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@web-portal-us.iam.gserviceaccount.com
PORT=5002
```

## 8. Key Features

### Current Implementation
- ✅ Neon Database integration
- ✅ Firebase Authentication
- ✅ Assistant Portal UI
- ✅ User management (create, update role)
- ✅ Subject/Class/Room management
- ✅ Schedule management
- ✅ Request management
- ✅ Seed script (50 users)

### Future Enhancements
- 🔄 Event-driven architecture (RabbitMQ/Redis)
- 🔄 Real-time room status updates
- 🔄 Push notifications
- 🔄 Student/Lecturer UI (if needed)

## 9. Development Workflow

1. **Setup**
   - Clone project
   - Install dependencies (`npm install` in each service)
   - Configure Neon Database connection string
   - Run `create-tables.sql` in Neon SQL Editor
   - Configure Firebase credentials

2. **Run Services**
   - Terminal 1: `cd services/core && npm run dev`
   - Terminal 2: `cd services/realtime && npm run dev`
   - Terminal 3: `cd portal-ui-react && npm run dev`

3. **Seed Data**
   - `cd services/core && npm run seed:users`

4. **Test**
   - Health check: `curl http://localhost:4000/health`
   - API tests: `node test-api.js`

## 10. Advantages of Neon Database

- ✅ **Serverless**: Không cần quản lý server
- ✅ **Auto-scaling**: Tự động scale theo nhu cầu
- ✅ **Connection pooling**: Tự động quản lý connections
- ✅ **SSL required**: Bảo mật mặc định
- ✅ **Free tier**: Có plan miễn phí
- ✅ **Simple setup**: Connection string đơn giản

---

**Xem thêm:**
- [NEON_ARCHITECTURE.md](../NEON_ARCHITECTURE.md) - Chi tiết về Neon Database
- [README.md](../README.md) - Main documentation
- [SETUP_GUIDE.md](../SETUP_GUIDE.md) - Setup instructions
