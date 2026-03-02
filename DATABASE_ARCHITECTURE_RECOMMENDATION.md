# 🏗️ Kiến Trúc Database: Notifications & Requests

## 📊 Phân Tích Use Cases

### **Notifications (Thông báo)**
**Đặc điểm:**
- ✅ Cần **realtime updates** (push notifications)
- ✅ Cần **persistence** (lưu lịch sử)
- ✅ Volume cao (nhiều notifications/user)
- ✅ Cần **read/unread status** tracking
- ✅ Cần **filtering** (theo user, type, read status)
- ⚠️ Không cần **complex queries** (JOIN nhiều bảng)
- ⚠️ Không cần **ACID transactions** phức tạp

### **Requests (Yêu cầu)**
**Đặc điểm:**
- ✅ Cần **workflow management** (PENDING → APPROVED/REJECTED)
- ✅ Cần **audit trail** (ai approve, khi nào, ghi chú gì)
- ✅ Cần **complex queries** (JOIN với User, Class, Subject)
- ✅ Cần **ACID transactions** (khi update status)
- ✅ Cần **reporting & analytics** (thống kê requests)
- ⚠️ Không cần **realtime mạnh** (polling 5-10s là đủ)
- ⚠️ Volume thấp hơn notifications

---

## 🔄 So Sánh: Firebase Realtime vs Neon PostgreSQL

### **Firebase Firestore (Realtime Database)**

#### ✅ Ưu điểm:
1. **Realtime Updates**
   - WebSocket-like subscriptions
   - Tự động sync changes
   - Perfect cho notifications

2. **Offline Support**
   - Tự động cache
   - Sync khi online lại

3. **Scalability**
   - Auto-scaling
   - Không cần quản lý infrastructure

4. **Simple API**
   - Client SDK dễ dùng
   - Real-time listeners

#### ❌ Nhược điểm:
1. **Query Limitations**
   - Không có JOIN
   - Filtering phức tạp khó
   - Indexing hạn chế

2. **Cost**
   - Pay per read/write
   - Có thể đắt với volume cao

3. **Data Consistency**
   - Eventual consistency
   - Không có ACID transactions

4. **Vendor Lock-in**
   - Khó migrate sang hệ thống khác

---

### **Neon PostgreSQL (Relational Database)**

#### ✅ Ưu điểm:
1. **ACID Transactions**
   - Data consistency
   - Perfect cho requests workflow

2. **Complex Queries**
   - JOIN nhiều bảng
   - Aggregations, analytics
   - Reporting dễ dàng

3. **Data Integrity**
   - Foreign keys
   - Constraints
   - Relational model

4. **Cost**
   - Free tier rộng rãi
   - Predictable pricing

5. **Standard SQL**
   - Dễ migrate
   - Tool ecosystem phong phú

#### ❌ Nhược điểm:
1. **No Native Realtime**
   - Cần polling hoặc WebSocket server
   - Không có built-in subscriptions

2. **Connection Management**
   - Cần connection pooling
   - Serverless có thể có cold starts

3. **Setup Complexity**
   - Cần quản lý schema
   - Migrations

---

## 🎯 Đề Xuất Kiến Trúc

### **Option 1: Hybrid Approach (Recommended) ⭐**

```
┌─────────────────────────────────────────┐
│         Notifications                   │
├─────────────────────────────────────────┤
│ Primary: Firebase Firestore              │
│ - Realtime updates                       │
│ - Push notifications                     │
│ - Read/unread status                     │
│                                          │
│ Backup: Neon PostgreSQL                 │
│ - Historical data                        │
│ - Analytics & reporting                  │
│ - Audit trail                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Requests                        │
├─────────────────────────────────────────┤
│ Primary: Neon PostgreSQL                │
│ - Workflow management                   │
│ - Complex queries (JOIN User, Class)    │
│ - ACID transactions                      │
│ - Analytics & reporting                  │
│                                          │
│ Realtime: Polling (5-10s)               │
│ - Frontend polling                      │
│ - Hoặc WebSocket server (optional)      │
└─────────────────────────────────────────┘
```

**Lý do:**
- ✅ Notifications cần realtime → Firestore
- ✅ Requests cần complex queries → PostgreSQL
- ✅ Best of both worlds
- ✅ Cost-effective

---

### **Option 2: All Neon PostgreSQL**

```
┌─────────────────────────────────────────┐
│         Notifications                   │
├─────────────────────────────────────────┤
│ Database: Neon PostgreSQL               │
│                                          │
│ Realtime:                                │
│ - WebSocket server (Express + WS)      │
│ - Hoặc Server-Sent Events (SSE)        │
│ - Hoặc Polling (5-10s)                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Requests                        │
├─────────────────────────────────────────┤
│ Database: Neon PostgreSQL               │
│ - Workflow management                   │
│ - Complex queries                       │
│ - ACID transactions                     │
└─────────────────────────────────────────┘
```

**Lý do:**
- ✅ Single source of truth
- ✅ Dễ maintain
- ✅ Cost-effective
- ⚠️ Cần implement realtime layer

---

### **Option 3: All Firebase Firestore**

```
┌─────────────────────────────────────────┐
│         Notifications                   │
├─────────────────────────────────────────┤
│ Database: Firebase Firestore            │
│ - Realtime updates                      │
│ - Push notifications                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Requests                        │
├─────────────────────────────────────────┤
│ Database: Firebase Firestore            │
│ - Workflow management                   │
│ - Realtime updates                      │
│ ⚠️ Complex queries khó                  │
│ ⚠️ JOIN phải fetch nhiều documents     │
└─────────────────────────────────────────┘
```

**Lý do:**
- ✅ Realtime cho cả hai
- ✅ Simple architecture
- ❌ Requests queries phức tạp
- ❌ Cost cao với volume lớn

---

## 🏆 Recommendation: **Option 1 - Hybrid Approach**

### **Implementation Plan**

#### **1. Notifications: Firebase Firestore (Primary) + Neon (Backup)**

```typescript
// Flow:
1. Create notification → Write to Firestore (realtime)
2. Background job → Sync to Neon (for analytics)
3. Frontend → Subscribe Firestore (realtime updates)
4. Analytics → Query Neon (complex reports)
```

**Benefits:**
- ✅ Realtime updates cho users
- ✅ Historical data trong Neon
- ✅ Analytics & reporting từ Neon
- ✅ Cost-effective (Firestore cho active, Neon cho archive)

#### **2. Requests: Neon PostgreSQL (Primary) + Polling/WebSocket**

```typescript
// Flow:
1. Create/Update request → Write to Neon (ACID)
2. Frontend → Poll API every 5-10s
3. Hoặc → WebSocket server (optional, nếu cần realtime mạnh)
4. Analytics → Query Neon (complex JOIN queries)
```

**Benefits:**
- ✅ Complex queries (JOIN User, Class, Subject)
- ✅ ACID transactions cho workflow
- ✅ Analytics & reporting dễ dàng
- ✅ Cost-effective

---

## 📝 Implementation Details

### **Notifications Architecture**

```typescript
// services/core/src/routes/notifications.ts
// - Create notification → Write to Firestore
// - Background sync → Neon (optional)

// services/realtime/src/routes/notifications.ts
// - Firestore listeners
// - Push notifications

// Frontend
// - Subscribe Firestore collection
// - Real-time updates
```

### **Requests Architecture**

```typescript
// services/core/src/routes/requests.ts
// - All CRUD operations → Neon PostgreSQL
// - Complex queries với JOIN

// Frontend
// - Poll API every 5-10s (hoặc WebSocket)
// - Update UI khi có changes
```

---

## 💰 Cost Comparison

### **Firebase Firestore**
- Free tier: 50K reads/day, 20K writes/day
- Paid: $0.06/100K reads, $0.18/100K writes
- **Notifications**: ~100K reads/day → ~$6/month

### **Neon PostgreSQL**
- Free tier: 0.5GB storage, unlimited connections
- Paid: $19/month (Pro plan)
- **Requests**: Volume thấp → Free tier đủ

### **Hybrid Cost**
- Firestore: ~$6/month (notifications)
- Neon: Free tier (requests + notifications backup)
- **Total: ~$6/month** ✅

---

## 🎯 Final Recommendation

### **✅ Use Firebase Firestore for Notifications**
- Realtime updates
- Push notifications
- Read/unread tracking
- User experience tốt

### **✅ Use Neon PostgreSQL for Requests**
- Complex queries (JOIN)
- ACID transactions
- Workflow management
- Analytics & reporting

### **✅ Optional: Sync Notifications to Neon**
- Historical data
- Analytics
- Backup

---

## 🔄 Migration Path

### **Current State:**
- ✅ Notifications: Neon PostgreSQL
- ✅ Requests: Neon PostgreSQL

### **Recommended State:**
- 🔄 Notifications: Firebase Firestore (primary) + Neon (backup)
- ✅ Requests: Neon PostgreSQL (keep as is)

### **Migration Steps:**
1. Setup Firebase Firestore for notifications
2. Update backend to write to Firestore
3. Update frontend to subscribe Firestore
4. Background job sync to Neon (optional)
5. Keep Neon for requests (no change)

---

## 📊 Summary Table

| Feature | Notifications | Requests | Winner |
|---------|--------------|----------|--------|
| **Realtime** | ⭐⭐⭐⭐⭐ Critical | ⭐⭐ Nice to have | Firestore / Polling |
| **Complex Queries** | ⭐⭐ Simple | ⭐⭐⭐⭐⭐ Critical | PostgreSQL |
| **ACID** | ⭐⭐ Not critical | ⭐⭐⭐⭐⭐ Critical | PostgreSQL |
| **Cost** | ⭐⭐⭐ Medium | ⭐⭐⭐⭐⭐ Low | PostgreSQL |
| **Scalability** | ⭐⭐⭐⭐⭐ High | ⭐⭐⭐ Medium | Firestore / PostgreSQL |
| **Maintenance** | ⭐⭐⭐ Medium | ⭐⭐⭐⭐ Low | PostgreSQL |

**Final Decision:**
- **Notifications** → Firebase Firestore (realtime) + Neon (backup)
- **Requests** → Neon PostgreSQL (complex queries + ACID)















