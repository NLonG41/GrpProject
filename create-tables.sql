-- SQL Script to create all tables for USTH Academic Suite
-- Run this in Neon Database SQL Editor or psql

-- ============================================
-- 1. Create Enum Types
-- ============================================

CREATE TYPE "Role" AS ENUM ('ADMIN', 'ASSISTANT', 'LECTURER', 'STUDENT');
CREATE TYPE "RequestType" AS ENUM ('REQ_LEAVE', 'REQ_MAKEUP');
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "ScheduleType" AS ENUM ('MAIN', 'MAKEUP', 'EXAM');
CREATE TYPE "ScheduleStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- ============================================
-- 2. Create Tables
-- ============================================

-- User table
CREATE TABLE "User" (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL UNIQUE,
  password     TEXT NOT NULL,
  role         "Role" NOT NULL DEFAULT 'STUDENT',
  "fullName"   TEXT NOT NULL,
  "studentCode" TEXT UNIQUE,
  cohort       TEXT,
  major        TEXT,
  department   TEXT,
  specialty    TEXT,
  "createdAt"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Subject table
CREATE TABLE "Subject" (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  credits      INTEGER NOT NULL,
  faculty      TEXT NOT NULL,
  description  TEXT,
  "createdAt"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SubjectPrerequisite table
CREATE TABLE "SubjectPrerequisite" (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "subjectId"     TEXT NOT NULL,
  "prerequisiteId" TEXT NOT NULL,
  FOREIGN KEY ("subjectId") REFERENCES "Subject"(id) ON DELETE CASCADE,
  FOREIGN KEY ("prerequisiteId") REFERENCES "Subject"(id) ON DELETE CASCADE
);

-- Room table
CREATE TABLE "Room" (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  capacity      INTEGER NOT NULL,
  location      TEXT NOT NULL,
  "isMaintenance" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Class table
CREATE TABLE "Class" (
  id                TEXT PRIMARY KEY,
  "subjectId"       TEXT NOT NULL,
  "lecturerId"      TEXT NOT NULL,
  name              TEXT NOT NULL,
  "maxCapacity"     INTEGER NOT NULL,
  "currentEnrollment" INTEGER NOT NULL DEFAULT 0,
  "isActive"        BOOLEAN NOT NULL DEFAULT true,
  "startDate"       TIMESTAMP NOT NULL,
  "endDate"         TIMESTAMP NOT NULL,
  "createdAt"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("subjectId") REFERENCES "Subject"(id),
  FOREIGN KEY ("lecturerId") REFERENCES "User"(id)
);

-- Enrollment table
CREATE TABLE "Enrollment" (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentId"   TEXT NOT NULL,
  "classId"     TEXT NOT NULL,
  "registeredAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "midtermScore" DOUBLE PRECISION,
  "finalScore"   DOUBLE PRECISION,
  "totalGrade"  DOUBLE PRECISION,
  FOREIGN KEY ("studentId") REFERENCES "User"(id),
  FOREIGN KEY ("classId") REFERENCES "Class"(id),
  UNIQUE ("studentId", "classId")
);

-- ClassSchedule table
CREATE TABLE "ClassSchedule" (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "classId" TEXT NOT NULL,
  "roomId"  TEXT NOT NULL,
  "startTime" TIMESTAMP NOT NULL,
  "endTime" TIMESTAMP NOT NULL,
  type      "ScheduleType" NOT NULL DEFAULT 'MAIN',
  status    "ScheduleStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("classId") REFERENCES "Class"(id),
  FOREIGN KEY ("roomId") REFERENCES "Room"(id)
);

-- Notification table
CREATE TABLE "Notification" (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "toUserId" TEXT NOT NULL,
  "fromUserId" TEXT NOT NULL,
  type      TEXT NOT NULL,
  title     TEXT NOT NULL,
  message   TEXT NOT NULL,
  read      BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("toUserId") REFERENCES "User"(id),
  FOREIGN KEY ("fromUserId") REFERENCES "User"(id)
);

-- Request table
CREATE TABLE "Request" (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "senderId" TEXT NOT NULL,
  type       "RequestType" NOT NULL,
  status     "RequestStatus" NOT NULL DEFAULT 'PENDING',
  payload    JSONB NOT NULL,
  "adminNote" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("senderId") REFERENCES "User"(id)
);

-- ============================================
-- 3. Create Indexes for better performance
-- ============================================

CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_student_code ON "User"("studentCode");
CREATE INDEX idx_class_subject ON "Class"("subjectId");
CREATE INDEX idx_class_lecturer ON "Class"("lecturerId");
CREATE INDEX idx_enrollment_student ON "Enrollment"("studentId");
CREATE INDEX idx_enrollment_class ON "Enrollment"("classId");
CREATE INDEX idx_schedule_class ON "ClassSchedule"("classId");
CREATE INDEX idx_schedule_room ON "ClassSchedule"("roomId");
CREATE INDEX idx_notification_to_user ON "Notification"("toUserId");
CREATE INDEX idx_notification_read ON "Notification"(read);
CREATE INDEX idx_request_sender ON "Request"("senderId");
CREATE INDEX idx_request_status ON "Request"(status);

-- ============================================
-- 4. Create function to update updatedAt timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updatedAt
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subject_updated_at BEFORE UPDATE ON "Subject"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_updated_at BEFORE UPDATE ON "Room"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_updated_at BEFORE UPDATE ON "Class"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_request_updated_at BEFORE UPDATE ON "Request"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Done! Tables created successfully
-- ============================================

