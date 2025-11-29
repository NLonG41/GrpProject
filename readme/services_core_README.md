# Core Service (Service A)

**Responsibilities:**
- Authentication & user management (Admin, Lecturer, Student)
- CRUD master data: subjects, classes, enrollments, grades
- Scheduling logic and conflict detection (table `class_schedule`)
- Event publishing after schedule changes (to Service B)

## Tech Stack
- Node.js + TypeScript
- Express.js
- Prisma ORM + PostgreSQL
- Zod for validation

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .ENV .env
   # Edit .env with your PostgreSQL connection string
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /health` - Health check
- `POST /schedules` - Create class schedule (with conflict detection)

## Database Schema

See `prisma/schema.prisma` for full schema definition.

Main tables:
- `users` - Admin, Lecturer, Student accounts
- `subjects` - Course subjects
- `classes` - Class instances
- `class_schedule` - Scheduled class sessions
- `enrollments` - Student enrollments
- `rooms` - Room information

## Event Emission

After creating a schedule, Service A emits events to Service B (realtime service) via HTTP webhook (configurable via `EVENT_BROKER_URL`). In production, this should use RabbitMQ or Redis PubSub.
