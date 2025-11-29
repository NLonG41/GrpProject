# Debug Service B (Realtime)

## Kiểm tra Service B có chạy:

1. **Kiểm tra port 5002:**
   ```bash
   netstat -ano | findstr :5002
   ```

2. **Kiểm tra file .env:**
   - Đảm bảo file `.env` có đầy đủ 3 biến:
     - `FIREBASE_PROJECT_ID=web-portal-us`
     - `FIREBASE_PRIVATE_KEY="..."` (có dấu ngoặc kép)
     - `FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@web-portal-us.iam.gserviceaccount.com`

3. **Start Service B và xem log:**
   ```bash
   cd services/realtime
   npm run dev
   ```

4. **Lỗi thường gặp:**

   **a) Missing env vars:**
   ```
   Error: Missing required env var FIREBASE_PROJECT_ID
   ```
   → Kiểm tra file `.env` có đầy đủ biến

   **b) Firebase credential error:**
   ```
   Error: Error loading service account credentials
   ```
   → Kiểm tra `FIREBASE_PRIVATE_KEY` có đúng format (có dấu ngoặc kép, giữ nguyên \n)

   **c) Port already in use:**
   ```
   Error: listen EADDRINUSE :::5002
   ```
   → Kill process cũ hoặc đổi port

5. **Test sau khi start:**
   ```bash
   curl.exe http://localhost:5002/health
   ```
   → Phải trả về: `{"status":"ok","service":"realtime"}`

## Nếu vẫn lỗi:
- Copy toàn bộ error message từ terminal
- Kiểm tra Firebase Console → Project Settings → Service Accounts
- Đảm bảo Service Account có quyền Firestore

