# Realtime Service (Service B)

**Responsibilities:**
- Consume events from Service A (room status, notifications)
- Update Firestore documents such as `live_rooms/{roomId}` with real-time occupancy
- Manage student notification collection (read by client apps)
- Provide HTTP endpoints for events and notifications

## Tech Stack
- Node.js + TypeScript
- Express.js
- Firebase Admin SDK + Firestore
- Zod for validation

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Firebase:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Copy the JSON content

3. **Configure environment:**
   ```bash
   cp env.sample .env
   # Edit .env with your Firebase credentials:
   # - FIREBASE_PROJECT_ID
   # - FIREBASE_PRIVATE_KEY (full key with \n)
   # - FIREBASE_CLIENT_EMAIL
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /health` - Health check
- `POST /events/room-status` - Receive room status events from Service A
- `POST /notifications` - Create notification for student
- `GET /notifications/:userId?unread=true` - Get notifications for user

## Firestore Collections

### `live_rooms/{roomId}`
Real-time room status:
```json
{
  "roomId": "ROOM-A402",
  "currentStatus": "occupied" | "available",
  "currentClassId": "CLASS-CS101-A" | null,
  "occupiedUntil": "2025-12-01T10:00:00Z" | null,
  "lastUpdated": "2025-11-29T..."
}
```

### `notifications/{notificationId}`
Student notifications:
```json
{
  "id": "...",
  "toUserId": "user-student-001",
  "fromUserId": "user-admin-001",
  "type": "attendance-warning",
  "title": "...",
  "message": "...",
  "read": false,
  "createdAt": "..."
}
```

## Integration with Service A

Service A (Core) calls this service via HTTP webhook:
```
POST http://localhost:5002/events/room-status
```

In production, this should use RabbitMQ or Redis PubSub for better reliability.
