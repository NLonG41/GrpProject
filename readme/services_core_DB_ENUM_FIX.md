# Hướng dẫn sửa lỗi Enum trong PostgreSQL

## Vấn đề
Lỗi `ERROR: type "Role" does not exist` khi chạy `ALTER TYPE`.

## Nguyên nhân
PostgreSQL phân biệt chữ hoa-thường với tên được đặt trong dấu ngoặc kép. Tên enum trong database có thể khác với tên trong Prisma model (ví dụ: `Role` vs `role`).

## Cách 1: Sửa bằng SQL (Khuyến nghị)

### Bước 1: Tìm tên Enum chính xác
Chạy lệnh sau trong pgAdmin để tìm tên enum liên quan đến role:
```sql
SELECT t.typname AS enum_name, e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public' AND t.typname LIKE '%Role%';
```

Kết quả sẽ hiển thị tên enum đúng (ví dụ: `Role`).

### Bước 2: Thêm giá trị `ASSISTANT`
Sử dụng tên enum bạn tìm thấy ở bước 1:
```sql
-- Thay "Role" bằng tên đúng nếu cần
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ASSISTANT';
```

### Bước 3: Kiểm tra lại
```sql
-- Chạy lại lệnh ở Bước 1 để xem ASSISTANT đã được thêm chưa
```

## Cách 2: Reset Database (Dễ nhất - **Sẽ mất hết dữ liệu**)
Nếu cách trên không được, cách đơn giản nhất là reset database để đồng bộ lại từ đầu.

**Cảnh báo: Lệnh này sẽ xóa toàn bộ dữ liệu trong database `usth_portal` của bạn.**

```bash
# Chạy trong terminal, ở thư mục services/core
npx prisma migrate reset --force
```

Lệnh này sẽ:
1.  Xóa database.
2.  Tạo lại database.
3.  Chạy tất cả migrations, bao gồm cả việc thêm role `ASSISTANT`.

## Sau khi sửa
Dù bạn dùng cách nào, hãy chạy lại lệnh này để cập nhật Prisma Client:
```bash
npx prisma generate
```

Sau đó, restart Core service và bạn sẽ có thể tạo user với role `ASSISTANT`.