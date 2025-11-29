# Feature Implementation Template

Sử dụng template này cho mọi feature mới.

## 1. Feature Analysis

### Feature Name: [Tên feature]
### Description: [Mô tả ngắn gọn]
### User Stories:
- As a [role], I want to [action] so that [benefit]

### Related Features:
- [ ] Feature 1
- [ ] Feature 2

## 2. Database Changes

### New Models:
```prisma
// Thêm vào schema.prisma
```

### Migrations:
- [ ] Create migration file
- [ ] Run migration
- [ ] Verify schema

## 3. Backend Implementation

### API Routes:
- [ ] `GET /api/[feature]` - List
- [ ] `GET /api/[feature]/:id` - Get one
- [ ] `POST /api/[feature]` - Create
- [ ] `PATCH /api/[feature]/:id` - Update
- [ ] `DELETE /api/[feature]/:id` - Delete

### Files to Create:
```
services/core/
  src/routes/[feature].ts
  src/lib/[feature].ts (optional)
```

### Files to Modify:
```
services/core/
  src/app.ts - Add routes
  prisma/schema.prisma - Add models
```

## 4. Frontend Implementation

### Repository Layer:
```
src/features/[feature]/
  repositories/
    [feature]Repository.ts
```

### Hooks (Business Logic):
```
src/features/[feature]/
  hooks/
    use[Feature].ts
    use[Feature]Stats.ts (if needed)
```

### Components (UI):
```
src/features/[feature]/
  components/
    [Feature]List.tsx
    [Feature]Form.tsx
    [Feature]Card.tsx
  index.ts
```

### Files to Modify:
```
src/api/client.js - Add API methods
src/routing.js - Add routes (if needed)
```

## 5. Integration Checklist

- [ ] Backend routes registered
- [ ] Frontend routes added
- [ ] Navigation links updated
- [ ] Context providers updated (if needed)
- [ ] TypeScript compiles without errors
- [ ] No circular dependencies
- [ ] All imports resolved

## 6. Testing

### Unit Tests:
- [ ] Repository tests
- [ ] Hook tests
- [ ] Component tests

### Integration Tests:
- [ ] API endpoint tests
- [ ] E2E tests

### Manual Testing:
- [ ] Happy path
- [ ] Error cases
- [ ] Edge cases

## 7. Documentation

- [ ] API documentation
- [ ] Component documentation
- [ ] Usage examples

