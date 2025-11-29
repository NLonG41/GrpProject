# Fix Port Conflict

Service A (Core) đang bị conflict port 4000.

## Giải pháp:

**Option 1: Đổi port Service A sang 5001 (khuyến nghị)**
- Trong file `services/core/.ENV` hoặc `.env`, đảm bảo:
  ```
  PORT=5001
  ```
- Hoặc xóa dòng PORT để dùng mặc định 5001

**Option 2: Giữ port 4000**
- Kill process cũ trước khi start:
  ```bash
  netstat -ano | findstr :4000
  taskkill /F /PID <PID>
  ```

## Ports mặc định:
- **Service A (Core)**: 5001 (hoặc 4000 nếu set trong .ENV)
- **Service B (Realtime)**: 5002

## Start services:
```bash
# Terminal 1: Service A
cd services/core
npm run dev

# Terminal 2: Service B  
cd services/realtime
npm run dev
```

