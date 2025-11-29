# Cách Start Service B (Realtime)

## Vấn đề:
Service B có thể start nhưng bị kill ngay sau đó hoặc không listen được trên port 5002.

## Giải pháp:

### Cách 1: Start trong terminal riêng (Khuyến nghị)

1. **Mở terminal mới** (giữ terminal hiện tại để chạy Service A)

2. **Start Service B:**
   ```bash
   cd D:\GroupProject\services\realtime
   npm run dev
   ```

3. **Giữ terminal này mở** - Service B sẽ chạy và hiển thị:
   ```
   Realtime service running on http://localhost:5002
   ```

4. **Test trong terminal khác:**
   ```bash
   curl.exe http://localhost:5002/health
   ```
   → Phải trả về: `{"status":"ok","service":"realtime"}`

### Cách 2: Start bằng file đã build

```bash
cd D:\GroupProject\services\realtime
npm run build
node dist/index.js
```

### Kiểm tra Service đang chạy:

```bash
# Kiểm tra port 5002
netstat -ano | findstr :5002

# Nếu có process, test health
curl.exe http://localhost:5002/health
```

### Nếu vẫn lỗi:

1. **Kiểm tra file .env có đầy đủ:**
   - `FIREBASE_PROJECT_ID=web-portal-us`
   - `FIREBASE_PRIVATE_KEY="..."`
   - `FIREBASE_CLIENT_EMAIL=...`

2. **Kiểm tra port conflict:**
   ```bash
   netstat -ano | findstr :5002
   # Nếu có, kill process:
   taskkill /F /PID <PID>
   ```

3. **Xem log lỗi trong terminal khi start**

## Ports:
- **Service A (Core)**: 5001 (hoặc 4000 nếu set trong .ENV)
- **Service B (Realtime)**: 5002

