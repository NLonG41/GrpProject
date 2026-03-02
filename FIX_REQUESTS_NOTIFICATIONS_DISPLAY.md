# ✅ Đã Fix: Requests và Notifications Không Hiển Thị

## 🔍 Vấn đề

Requests và notifications đã có trong database Neon nhưng không hiển thị ở frontend.

**Nguyên nhân:**
- Backend yêu cầu header `x-user-id` để authenticate
- Frontend API client không gửi header `x-user-id` trong các request
- Backend trả về lỗi 401 Unauthorized hoặc không trả về data

## ✅ Giải pháp đã thực hiện

### 1. **Tạo Helper Function `getAuthHeaders()`**
- File: `portal-ui-react/src/shared/api/client.ts`
- Function để build headers với `x-user-id`:
  ```typescript
  function getAuthHeaders(userId?: string): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (userId) {
      headers['x-user-id'] = userId
    }
    return headers
  }
  ```

### 2. **Cập nhật API Methods**

#### **Requests API:**
- `getRequests()`: Thêm parameter `userId` và gửi header `x-user-id`
- `getRequest()`: Thêm parameter `userId` và gửi header `x-user-id`
- `updateRequest()`: Thêm parameter `userId` và gửi header `x-user-id`

#### **Notifications API:**
- `getNotifications()`: Thêm parameter `userId` và gửi header `x-user-id`

### 3. **Cập nhật Repository Layer**

#### **requestsRepository.ts:**
- Thêm `userId` parameter vào các methods:
  - `getAll(params, userId)`
  - `getById(id, userId)`
  - `approve(id, adminNote, userId)`
  - `decline(id, adminNote, userId)`

### 4. **Cập nhật Hooks**

#### **useRequests.ts:**
- Import `useAuthStore` để lấy `user.id`
- Truyền `userId: user?.id` vào `requestsRepository.getAll()`
- Truyền `user?.id` vào `approveRequest()` và `declineRequest()`
- Thêm dependency `user` vào `useEffect`

#### **NotificationPanel.tsx:**
- Cập nhật `loadNotifications()` để truyền `userId: user.id` vào `api.getNotifications()`

## 📝 Backend Requirements

Backend routes yêu cầu header `x-user-id`:

### Requests:
- `GET /api/requests` - Không yêu cầu auth (public)
- `PUT /api/requests/:id` - Yêu cầu `requireAssistant` middleware → cần `x-user-id`

### Notifications:
- `GET /api/notifications` - Yêu cầu `requireAuth` middleware → cần `x-user-id`
- `POST /api/notifications` - Yêu cầu `requireAssistant` middleware → cần `x-user-id`

## 🧪 Test

### 1. Test Requests
```bash
# Mở browser console và kiểm tra:
# - RequestSection component load requests
# - Không còn lỗi 401 Unauthorized
# - Requests hiển thị trong table
```

### 2. Test Notifications
```bash
# Mở NotificationPanel và kiểm tra:
# - Notifications load thành công
# - Không còn lỗi 401 Unauthorized
# - Notifications hiển thị trong panel
```

### 3. Test API trực tiếp
```bash
# Test với curl (thay YOUR_USER_ID và YOUR_ASSISTANT_ID)
curl -H "x-user-id: YOUR_ASSISTANT_ID" http://localhost:4000/api/requests
curl -H "x-user-id: YOUR_USER_ID" http://localhost:4000/api/notifications?toUserId=YOUR_USER_ID
```

## ✅ Kết quả

- ✅ API client đã gửi header `x-user-id` trong tất cả requests
- ✅ Requests hiển thị trong RequestSection component
- ✅ Notifications hiển thị trong NotificationPanel component
- ✅ Không còn lỗi 401 Unauthorized
- ✅ Data từ database Neon hiển thị đúng ở frontend

## 🔄 Flow

1. **User đăng nhập** → `user` được lưu trong `authStore`
2. **Component mount** → Hook (`useRequests`, `NotificationPanel`) lấy `user.id` từ `authStore`
3. **API call** → Truyền `userId: user.id` vào API method
4. **API client** → `getAuthHeaders(userId)` tạo headers với `x-user-id`
5. **Backend** → Middleware verify `x-user-id` và trả về data
6. **Frontend** → Hiển thị data trong UI















