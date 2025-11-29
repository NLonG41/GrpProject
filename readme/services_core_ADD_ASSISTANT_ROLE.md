# Thêm Role ASSISTANT vào Database

## Đã cập nhật:
1. ✅ Prisma schema - thêm ASSISTANT vào enum Role
2. ✅ UI dropdown - thêm option ASSISTANT
3. ✅ Routing logic - ASSISTANT có thể vào Assistant Portal (giống ADMIN)
4. ✅ Color scheme - thêm màu indigo cho ASSISTANT

## Cần update database:

### Cách 1: Dùng SQL trực tiếp (Khuyên dùng)
```sql
-- Kiểm tra enum hiện tại
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Role');

-- Thêm ASSISTANT vào enum (nếu chưa có)
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ASSISTANT';
```

### Cách 2: Dùng Prisma Studio
1. Mở Prisma Studio: `npx prisma studio`
2. Vào table User
3. Edit user và chọn role ASSISTANT từ dropdown

### Cách 3: Reset và migrate lại (Mất data)
```bash
npx prisma migrate reset
npx prisma migrate dev
```

## Sau khi update database:
1. Generate Prisma client: `npx prisma generate`
2. Restart Core Service
3. Test tạo user với role ASSISTANT


