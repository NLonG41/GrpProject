# USTH Portal – Microservice Architecture (Step 1)

This document captures the target architecture before we refactor the existing mock setup. A PostgreSQL instance is being provisioned; once it is ready we will implement the services as outlined here.

## 1. High–Level Topology

```
┌────────────┐      ┌──────────────┐      ┌──────────────┐
│  Client    │ <--> │  Nginx GW    │ <--> │  Service A   │
│ (Web/App)  │      │ (api.usth)   │      │ Core API     │
└────────────┘      │  /core/*     │      │ Node + PG    │
                    │  /rt/*       │      └──────────────┘
                    │              │
                    │              │      ┌──────────────┐
                    │              └----> │  Service B   │
                    │  (reverse proxy)    │ Realtime/Noti│
                    └──────────────────── │ Node + Firestore
                                          └──────────────┘
```

- **Gateway (Nginx)** – single entry point.  
  - `/core/*` → Service A (business APIs).  
  - `/rt/*` → Service B (Firestore sync, notifications).  
  - Handles TLS, rate‑limit, auth headers forwarding.

- **Service A – Core (Node.js + PostgreSQL)**  
  - Owns master data: `users`, `subjects`, `classes`, `enrollments`, `grades`, `class_schedule`.  
  - Exposes REST APIs: Auth, CRUD master data, schedule management, enrollment actions.  
  - After a successful schedule insert it emits an event (`room-occupied`) with `{roomId, from, to}`.
  - Event transport: RabbitMQ (preferred) or fallback HTTP/Redis pubsub until MQ cluster is ready.

- **Service B – Realtime/Notifications (Node.js + Firebase Firestore)**  
  - Subscribes to events from Service A.  
  - Persists only **realtime** documents (e.g., `live_rooms/{roomId}` with `currentStatus`, `nextSlot`).  
  - Manages user notifications collection `notifications/{userId}/items`.  
  - Optionally exposes `/rt/notify` for manual pushes (assistant announcements).  
  - Firestore → Client realtime subscription (student UI shows status instantly).

## 2. Data Flow: POST `/schedule`

1. **Client → Gateway → Service A**  
   - Payload: `{roomId, classId, date, startTime, endTime}`.  
   - Service A checks PostgreSQL for conflicts (`class_schedule` table).  
   - If free: INSERT row (status `ACTIVE`) and publish event `room.occupied`.

2. **Service A → Service B**  
   - Transport: RabbitMQ exchange `room.status`.  
   - Message body: `{roomId: "R101", from: "2025-11-28T08:00Z", to: "2025-11-28T10:00Z", status: "occupied", classId}`.

3. **Service B**  
   - Updates Firestore doc `live_rooms/R101` with `currentStatus = "occupied"` + metadata.  
   - Optionally writes notification for impacted students.  
   - Firestore change notifies subscribed clients instantly.

4. **Client**  
   - Student UI listens to `live_rooms` collection; when `R101` doc changes, UI switches color/state with no refresh.

## 3. Repository Layout (target)

```
gateway/                 # Nginx conf, Dockerfile
services/
  core/                  # Service A (Node + PostgreSQL)
    src/
    prisma|knex/
    package.json
  realtime/              # Service B (Node + Firestore)
    src/
    package.json
portal-ui/               # Web client (assistant & student UIs)
```

Legacy `portal-api/` (mock JSON) will be removed once Service A is functional.

## 4. Immediate Next Steps

1. Scaffold `gateway`, `services/core`, `services/realtime` folders with basic `package.json`/Docker files.  
2. Generate PostgreSQL schema (Prisma/Knex) and migration scripts.  
3. Define event contract (JSON schema) + queue infrastructure (RabbitMQ docker).  
4. Refactor portal-ui to:
   - Authenticate against Service A (real login).  
   - Route assistant vs student UI based on `role`.  
   - Subscribe to Firestore via Service B config.

This document will evolve as the refactor proceeds.



