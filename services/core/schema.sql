-- SQL Schema exported from Prisma
-- Use this at https://dbdiagram.io (paste in SQL mode)

CREATE TABLE "User" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid() DEFAULT uuid(,
  "email" VARCHAR(255) NOT NULL,
  "password" VARCHAR(255) NOT NULL DEFAULT STUDENT,
  "fullName" VARCHAR(255) NOT NULL,
  "cohort" VARCHAR(255),
  "department" VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(,
  "updatedAt" TIMESTAMP NOT NULL,
  "classesTaught" VARCHAR(255) NOT NULL,
  "enrollments" VARCHAR(255) NOT NULL,
  "sentNoti" VARCHAR(255) NOT NULL,
  "requests" VARCHAR(255) NOT NULL,
  UNIQUE ("email"),
  UNIQUE ("fullName")
);

CREATE TABLE "Subject" (
  "id" VARCHAR(255) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "faculty" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(,
  "updatedAt" TIMESTAMP NOT NULL,
  "classes" VARCHAR(255) NOT NULL,
  "requiredBy" VARCHAR(255) NOT NULL
);

CREATE TABLE "SubjectPrerequisite" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid() DEFAULT uuid(,
  "subjectId" VARCHAR(255) NOT NULL,
  "subject" VARCHAR(255) NOT NULL,
  "prerequisite" VARCHAR(255) NOT NULL
);

CREATE TABLE "Room" (
  "id" VARCHAR(255) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "capacity" INTEGER NOT NULL,
  "isMaintenance" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(,
  "updatedAt" TIMESTAMP NOT NULL,
  "schedules" VARCHAR(255) NOT NULL,
  UNIQUE ("name")
);

CREATE TABLE "Class" (
  "id" VARCHAR(255) PRIMARY KEY,
  "subjectId" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "currentEnrollment" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "startDate" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(,
  "updatedAt" TIMESTAMP NOT NULL,
  "subject" VARCHAR(255) NOT NULL,
  "lecturer" VARCHAR(255) NOT NULL,
  "schedules" VARCHAR(255) NOT NULL
);

CREATE TABLE "Enrollment" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid() DEFAULT uuid(,
  "studentId" VARCHAR(255) NOT NULL,
  "registeredAt" TIMESTAMP NOT NULL DEFAULT now(,
  "midtermScore" DOUBLE PRECISION,
  "totalGrade" DOUBLE PRECISION,
  "class" VARCHAR(255) NOT NULL
);

CREATE TABLE "ClassSchedule" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid() DEFAULT uuid(,
  "classId" VARCHAR(255) NOT NULL,
  "startTime" TIMESTAMP NOT NULL,
  "type" VARCHAR(255) NOT NULL DEFAULT MAIN,
  "status" VARCHAR(255) NOT NULL DEFAULT ACTIVE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(,
  "class" VARCHAR(255) NOT NULL,
  "room" VARCHAR(255) NOT NULL
);

CREATE TABLE "Notification" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid() DEFAULT uuid(,
  "toUserId" VARCHAR(255) NOT NULL,
  "type" VARCHAR(255) NOT NULL,
  "message" VARCHAR(255) NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(,
  "toUser" VARCHAR(255) NOT NULL,
  "fromUser" VARCHAR(255) NOT NULL
);

CREATE TABLE "Request" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid() DEFAULT uuid(,
  "senderId" VARCHAR(255) NOT NULL,
  "status" VARCHAR(255) NOT NULL DEFAULT PENDING,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(,
  "updatedAt" TIMESTAMP NOT NULL,
  "sender" VARCHAR(255) NOT NULL
);

