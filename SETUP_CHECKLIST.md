# ✅ Setup Checklist

Checklist để đảm bảo setup thành công với Neon Database.

## 📋 Trước Khi Bắt Đầu

- [ ] Đã cài đặt Node.js ≥ 18
- [ ] Đã kiểm tra: `node --version` (hiển thị ≥ 18.x)
- [ ] Đã kiểm tra: `npm --version` (hiển thị version)
- [ ] Đã clone/download project về máy
- [ ] Đã mở terminal/command prompt trong thư mục project

## 📁 Project Setup

- [ ] Đã vào thư mục project: `cd GroupProject`
- [ ] Đã kiểm tra các file cần thiết:
  - [ ] `services/core/package.json` tồn tại
  - [ ] `services/realtime/package.json` tồn tại
  - [ ] `portal-ui-react/package.json` tồn tại
  - [ ] `create-tables.sql` tồn tại

## 📦 Cài Đặt Dependencies

- [ ] Đã chạy: `cd portal-ui-react && npm install`
- [ ] Đã chạy: `cd services/core && npm install`
- [ ] Đã chạy: `cd services/realtime && npm install`
- [ ] Không có lỗi trong quá trình cài đặt

## 🗄️ Neon Database Setup

- [ ] Đã đăng ký tài khoản Neon tại https://console.neon.tech/
- [ ] Đã tạo project mới trong Neon Dashboard
- [ ] Đã copy connection string từ Neon Dashboard
- [ ] Đã tạo file `.env` trong `services/core/`
- [ ] Đã điền `DATABASE_URL` vào `.env` với connection string từ Neon
- [ ] Connection string có `sslmode=require&channel_binding=require`
- [ ] Đã vào Neon SQL Editor
- [ ] Đã mở file `create-tables.sql`
- [ ] Đã copy và paste toàn bộ SQL vào Neon SQL Editor
- [ ] Đã click **Run** để tạo tables
- [ ] Đã kiểm tra tables được tạo thành công (xem trong Neon Dashboard)

## 🔐 Cấu Hình Firebase

- [ ] Đã tạo Firebase project tại https://console.firebase.google.com/
- [ ] Đã vào Project Settings > Service Accounts
- [ ] Đã Generate New Private Key
- [ ] Đã download file JSON
- [ ] Đã copy `project_id` → `FIREBASE_PROJECT_ID` trong `.env`
- [ ] Đã copy `private_key` → `FIREBASE_PRIVATE_KEY` (với dấu ngoặc kép và `\n`)
- [ ] Đã copy `client_email` → `FIREBASE_CLIENT_EMAIL`
- [ ] Đã kiểm tra format file `.env` đúng:
  - [ ] `FIREBASE_PRIVATE_KEY` có dấu ngoặc kép `"`
  - [ ] Có `\n` trong private key
  - [ ] Không có lỗi syntax

## 🚀 Chạy Project

### Core Service

- [ ] Đã mở terminal 1
- [ ] Đã chạy: `cd services/core && npm run dev`
- [ ] Đã đợi service khởi động
- [ ] Logs hiển thị: `Core service running on http://localhost:4000`
- [ ] Đã test health endpoint: `curl http://localhost:4000/health`
- [ ] Health check trả về: `{"status":"ok","db":"reachable"}`

### Realtime Service

- [ ] Đã mở terminal 2
- [ ] Đã chạy: `cd services/realtime && npm run dev`
- [ ] Đã đợi service khởi động
- [ ] Logs hiển thị: `Realtime service running on http://localhost:5002`
- [ ] Không có lỗi Firebase authentication

### Frontend

- [ ] Đã mở terminal 3
- [ ] Đã chạy: `cd portal-ui-react && npm run dev`
- [ ] Đã đợi Vite khởi động
- [ ] Logs hiển thị: `Local: http://localhost:5173`
- [ ] Không có lỗi compilation

## ✅ Kiểm Tra Truy Cập

- [ ] Đã mở trình duyệt
- [ ] Đã truy cập http://localhost:5173
- [ ] Frontend hiển thị (không lỗi 404)
- [ ] Đã truy cập http://localhost:4000/health
- [ ] Health check trả về JSON với `"db": "reachable"`
- [ ] Đã truy cập http://localhost:5002
- [ ] Realtime service phản hồi

## 🗄️ Kiểm Tra Database

- [ ] Đã vào Neon Dashboard → SQL Editor
- [ ] Đã chạy query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
- [ ] Có các tables:
  - [ ] `User`
  - [ ] `Subject`
  - [ ] `Class`
  - [ ] `Room`
  - [ ] `Enrollment`
  - [ ] `ClassSchedule`
  - [ ] `Notification`
  - [ ] `Request`

## 👥 Tạo Tài Khoản Mẫu

- [ ] Đã chạy: `cd services/core && npm run seed:users`
- [ ] Script chạy thành công (không có lỗi)
- [ ] Đã kiểm tra trong Neon SQL Editor:
  - [ ] Có 30 users với role `STUDENT`
  - [ ] Có 20 users với role `LECTURER`
- [ ] Đã kiểm tra trong Firebase Console:
  - [ ] Users đã được tạo trong Firebase Auth

## 🎯 Hoàn Thành

- [ ] Tất cả services đang chạy
- [ ] Có thể truy cập frontend
- [ ] Database đã được setup
- [ ] Không có lỗi trong logs
- [ ] Project hoạt động chính xác

## 📝 Ghi Chú

Nếu có bước nào không hoàn thành:
- Xem [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Xem [NEON_DB_SETUP.md](./NEON_DB_SETUP.md)
- Xem [NEON_ARCHITECTURE.md](./NEON_ARCHITECTURE.md)
- Kiểm tra logs trong terminal
- Test health endpoint: `curl http://localhost:4000/health`

---

**Chúc bạn setup thành công! 🎉**
