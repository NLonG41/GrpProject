# SQL Commands để Check User Role

## Lỗi: `relation "User" does not exist`

PostgreSQL table names có thể khác với Prisma model names. Hãy thử các cách sau:

## Cách 1: Kiểm tra tên table thực tế

```sql
-- List all tables
\dt

-- Hoặc
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

## Cách 2: Thử với tên table lowercase

```sql
SELECT email, "fullName", role 
FROM "user" 
WHERE email = 'admin@usth.edu.vn';
```

## Cách 3: Thử không dùng quotes

```sql
SELECT email, "fullName", role 
FROM users 
WHERE email = 'admin@usth.edu.vn';
```

## Cách 4: Tìm table chứa user data

```sql
-- Tìm tất cả tables
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%user%' OR tablename LIKE '%User%';
```

## Cách 5: Dùng Prisma Studio (Khuyên dùng)

```bash
cd services/core
npx prisma studio
```

Mở `http://localhost:5555` và xem table `User` trực tiếp.

## Cách 6: Kiểm tra qua Prisma

Nếu Prisma migrations chưa chạy, table có thể chưa được tạo:

```bash
cd services/core
npx prisma migrate dev
```

Sau đó thử lại SQL query.


