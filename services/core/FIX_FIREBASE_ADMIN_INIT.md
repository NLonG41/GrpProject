# 🔧 Fix Firebase Admin SDK Initialization Error

## 🐛 Vấn Đề

Lỗi xảy ra khi gọi API `/api/auth/firebase-login`:
```
FirebaseAppError: The default Firebase app does not exist. 
Make sure you call initializeApp() before using any of the Firebase services.
```

**Nguyên nhân**: Firebase Admin SDK chưa được khởi tạo khi route được gọi.

## ✅ Đã Sửa

### 1. **Import Firebase Admin trong index.ts**
- Đảm bảo Firebase Admin được khởi tạo trước khi routes được load
- File: `services/core/src/index.ts`

```typescript
// Ensure Firebase Admin SDK is initialized before routes are loaded
import "./lib/firebase";
```

### 2. **Cải Thiện Firebase Admin Initialization**
- Thêm check chi tiết hơn
- Better error handling
- File: `services/core/src/lib/firebase.ts`

### 3. **Thêm Check trong Route**
- Check Firebase Admin đã được khởi tạo trước khi sử dụng
- File: `services/core/src/routes/auth.ts`

```typescript
// Ensure Firebase Admin SDK is initialized
if (!admin.apps.length) {
  return res.status(503).json({ error: "Firebase Admin SDK not initialized" });
}
```

## 🔍 Kiểm Tra

### 1. Check Firebase Admin Đã Khởi Tạo

Khi start backend, bạn sẽ thấy:
```
[firebase] Firebase Admin initialized successfully
```

### 2. Nếu Không Thấy Log

Check `.env` file:
```env
FIREBASE_PROJECT_ID=student-management-datab-bcfb1
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@student-management-datab-bcfb1.iam.gserviceaccount.com
```

### 3. Test API

```bash
# Test Firebase login endpoint
curl -X POST http://localhost:4000/api/auth/firebase-login \
  -H "Content-Type: application/json" \
  -d '{"idToken": "YOUR_TOKEN"}'
```

## 📋 Checklist

- [x] Import Firebase Admin trong `index.ts`
- [x] Cải thiện initialization logic
- [x] Thêm check trong route
- [x] Better error handling
- [ ] Test login từ frontend
- [ ] Verify Firebase Admin log khi start server

## 🚀 Sau Khi Sửa

1. **Restart Backend Server**:
   ```bash
   cd services/core
   npm run dev
   ```

2. **Check Logs**:
   - Tìm: `[firebase] Firebase Admin initialized successfully`
   - Không có error messages

3. **Test Login**:
   - Frontend: Login với `zzz@gmail.com / 123123`
   - Verify không còn lỗi 401

## 💡 Lưu Ý

- Firebase Admin SDK phải được khởi tạo **TRƯỚC** khi routes được sử dụng
- Import trong `index.ts` đảm bảo thứ tự initialization đúng
- Check `admin.apps.length` để verify Firebase Admin đã được khởi tạo

## ✅ Kết Luận

Sau khi sửa, Firebase Admin SDK sẽ được khởi tạo đúng cách và lỗi sẽ không còn xảy ra nữa.

