# 🔑 Tại sao project này cần Firebase Service Account?

## Tóm tắt

**Service Account** cho phép **backend** (Node.js server) có quyền **admin** để:
1. ✅ **Verify Firebase ID token** khi user đăng nhập
2. ✅ **Tạo user trong Firebase Auth** khi register
3. ✅ **Đọc/ghi Firestore** (notifications)

---

## So sánh: Client SDK vs Admin SDK

| | **Firebase Client SDK** (Frontend) | **Firebase Admin SDK** (Backend) |
|---|---|---|
| **Dùng ở đâu** | Browser/Mobile app | Node.js server |
| **File config** | `google-services.json` hoặc `firebaseConfig` | Service Account JSON |
| **Quyền** | Giới hạn (chỉ user hiện tại) | Admin (toàn quyền) |
| **Chức năng** | User đăng nhập, đọc dữ liệu của mình | Verify token, tạo user, quản lý toàn bộ |

---

## Chức năng cụ thể trong project này

### 1. **Verify Firebase ID Token** (Quan trọng nhất!)

**File:** `services/core/src/routes/auth.ts` (dòng 239)

```typescript
// User đăng nhập từ frontend → gửi Firebase ID token lên backend
const decodedToken = await admin.auth().verifyIdToken(idToken);
```

**Tại sao cần?**
- Frontend đăng nhập bằng Firebase Auth → nhận được **ID token**
- Backend **KHÔNG thể tin tưởng** token này nếu không verify
- Chỉ có **Admin SDK** mới có quyền verify token
- Sau khi verify, backend mới lấy user từ Supabase database

**Flow:**
```
Frontend: User nhập email/password 
  → Firebase Auth: Tạo ID token
  → Backend: Verify token (CẦN Service Account!)
  → Backend: Lấy user từ Supabase
  → Backend: Trả về user data
```

### 2. **Tạo User trong Firebase Auth khi Register**

**File:** `services/core/src/routes/auth.ts` (dòng 59)

```typescript
// Khi register, tự động tạo user trong Firebase Auth
const firebaseUser = await admin.auth().createUser({
  email: data.email,
  password: data.password,
  displayName: data.fullName,
});
```

**Tại sao cần?**
- Khi user register, backend tạo user trong **cả 2 nơi**:
  - Supabase database (lưu thông tin: role, studentCode, ...)
  - Firebase Auth (để user có thể đăng nhập)
- Chỉ có **Admin SDK** mới có quyền tạo user

### 3. **Truy cập Firestore (Notifications)**

**File:** `services/realtime/src/routes/notifications.ts`

```typescript
// Backend ghi notification vào Firestore
await notificationRef.set({
  toUserId,
  title,
  message,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
});
```

**Tại sao cần?**
- Backend cần **quyền admin** để đọc/ghi Firestore
- Client SDK chỉ đọc được dữ liệu của chính user đó
- Backend cần ghi notification cho **bất kỳ user nào**

---

## Nếu KHÔNG có Service Account?

❌ **Backend không thể:**
- Verify Firebase token → **Không thể xác thực user đăng nhập**
- Tạo user trong Firebase Auth → **User không thể đăng nhập sau khi register**
- Ghi Firestore → **Không thể tạo notifications**

✅ **Frontend vẫn hoạt động:**
- User vẫn có thể đăng nhập bằng Firebase Auth
- Nhưng backend **không thể verify** token → **Không thể lấy user data từ Supabase**

---

## Tóm lại

**Service Account = "Chìa khóa admin" cho backend**

- Frontend dùng **Client SDK** (không cần Service Account)
- Backend dùng **Admin SDK** (CẦN Service Account)

**Trong project này:**
- ✅ **Frontend:** Dùng Firebase Client SDK để user đăng nhập
- ✅ **Backend:** Dùng Firebase Admin SDK (Service Account) để:
  - Verify token từ frontend
  - Tạo user khi register
  - Quản lý notifications trong Firestore

---

## Bảo mật

⚠️ **Service Account có quyền ADMIN** → Phải bảo mật tuyệt đối:
- ❌ KHÔNG commit vào Git
- ✅ Chỉ lưu trong `.env` (đã có trong `.gitignore`)
- ✅ Chia sẻ qua môi trường an toàn

