# Firebase Admin SDK Setup Guide

Service B (realtime) cần Firebase Admin SDK credentials để write vào Firestore.

## Cách lấy credentials:

1. **Vào Firebase Console:**
   - Truy cập: https://console.firebase.google.com/project/web-portal-us/settings/serviceaccounts/adminsdk

2. **Generate new private key:**
   - Click "Generate new private key"
   - File JSON sẽ được download (ví dụ: `web-portal-us-firebase-adminsdk-xxxxx.json`)

3. **Copy thông tin vào `.env`:**
   ```bash
   PORT=5002
   FIREBASE_PROJECT_ID=web-portal-us
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@web-portal-us.iam.gserviceaccount.com
   ```

4. **Lấy từ JSON file:**
   - Mở file JSON đã download
   - Copy các giá trị:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `private_key` → `FIREBASE_PRIVATE_KEY` (giữ nguyên format với `\n`)
     - `client_email` → `FIREBASE_CLIENT_EMAIL`

## Ví dụ `.env`:

```env
PORT=5002
FIREBASE_PROJECT_ID=web-portal-us
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@web-portal-us.iam.gserviceaccount.com
```

## Lưu ý:
- `FIREBASE_PRIVATE_KEY` phải có dấu ngoặc kép và giữ nguyên `\n` trong key
- Không commit file `.env` vào git (đã có trong `.gitignore`)

