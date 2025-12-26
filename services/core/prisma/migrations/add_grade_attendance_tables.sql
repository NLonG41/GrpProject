-- Migration: Add GradeItem, Attendance, and GradeRecord tables
-- Run this in your database

-- Create enums
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
CREATE TYPE "GradeItemType" AS ENUM ('HOMEWORK', 'QUIZ', 'MIDTERM', 'FINAL', 'PROJECT', 'PARTICIPATION');

-- Create GradeItem table
CREATE TABLE "grade_item" (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "classId" TEXT NOT NULL,
  name      TEXT NOT NULL,
  "maxScore" DOUBLE PRECISION NOT NULL,
  weight    DOUBLE PRECISION NOT NULL,
  type      "GradeItemType" NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("classId") REFERENCES "class"(id) ON DELETE CASCADE
);

-- Create Attendance table
CREATE TABLE "attendance" (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "enrollmentId" TEXT NOT NULL,
  "scheduleId"  TEXT NOT NULL,
  status        "AttendanceStatus" NOT NULL,
  timestamp     TIMESTAMP NOT NULL DEFAULT NOW(),
  "verifiedBy"  TEXT,
  FOREIGN KEY ("enrollmentId") REFERENCES "enrollment"(id) ON DELETE CASCADE,
  FOREIGN KEY ("scheduleId") REFERENCES "class_schedule"(id) ON DELETE CASCADE,
  FOREIGN KEY ("verifiedBy") REFERENCES "User"(id)
);

-- Create GradeRecord table
CREATE TABLE "grade_record" (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "enrollmentId" TEXT NOT NULL,
  "gradeItemId" TEXT NOT NULL,
  score         DOUBLE PRECISION,
  "gradedAt"    TIMESTAMP,
  "gradedBy"    TEXT,
  FOREIGN KEY ("enrollmentId") REFERENCES "enrollment"(id) ON DELETE CASCADE,
  FOREIGN KEY ("gradeItemId") REFERENCES "grade_item"(id) ON DELETE CASCADE,
  FOREIGN KEY ("gradedBy") REFERENCES "User"(id),
  UNIQUE ("enrollmentId", "gradeItemId")
);

-- Create indexes for better performance
CREATE INDEX idx_grade_item_class ON "grade_item"("classId");
CREATE INDEX idx_attendance_enrollment ON "attendance"("enrollmentId");
CREATE INDEX idx_attendance_schedule ON "attendance"("scheduleId");
CREATE INDEX idx_attendance_verified_by ON "attendance"("verifiedBy");
CREATE INDEX idx_grade_record_enrollment ON "grade_record"("enrollmentId");
CREATE INDEX idx_grade_record_grade_item ON "grade_record"("gradeItemId");
CREATE INDEX idx_grade_record_graded_by ON "grade_record"("gradedBy");














