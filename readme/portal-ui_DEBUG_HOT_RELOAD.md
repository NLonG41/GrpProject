# Debug Hot Reload Issues

## Vấn đề: App tự động hot reload liên tục

### Nguyên nhân có thể:

1. **JavaScript Errors** - Lỗi syntax hoặc runtime
2. **Import Errors** - Module không tìm thấy
3. **DOM Not Ready** - Code chạy trước khi DOM sẵn sàng
4. **Infinite Render Loop** - render() gọi liên tục

## Cách debug:

### 1. Mở Browser Console (F12)
- Xem tab **Console** - tìm lỗi màu đỏ
- Xem tab **Network** - tìm requests failed (404, 500)
- Xem tab **Sources** - xem file nào đang reload

### 2. Chạy test script:
```bash
cd portal-ui
node test-hot-reload.js
```

### 3. Kiểm tra logs:
Tìm các log bắt đầu bằng `[UI]`:
- `[UI] Initializing app...`
- `[UI] DOM already ready...`
- `[UI] ERROR: ...`

### 4. Common Issues:

#### Issue 1: `isForgotPassword is not defined`
**Fix:** Đã thêm `const isForgotPassword = state.authMode === "forgot-password";` vào `renderLogin()`

#### Issue 2: `selectors.app is null`
**Fix:** Đã thêm `initSelectors()` và check DOM ready

#### Issue 3: Import errors
**Check:** 
- `./src/services/data.js` exists?
- `./src/api/client.js` exists?
- `./src/utils/userManagement.js` exists?

#### Issue 4: Infinite render loop
**Check:**
- render() được gọi trong event listeners?
- render() được gọi trong async functions không có error handling?

## Quick Fix Checklist:

- [x] Thêm `isForgotPassword` definition
- [x] Wrap initialization trong DOMContentLoaded
- [x] Thêm error handling trong render()
- [x] Check selectors.app trước khi render
- [ ] Kiểm tra browser console cho lỗi cụ thể
- [ ] Kiểm tra Network tab cho failed requests

## Nếu vẫn reload:

1. **Stop dev server** (Ctrl+C)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Restart dev server**
4. **Hard refresh** (Ctrl+Shift+R)
5. **Check console** cho lỗi cụ thể


