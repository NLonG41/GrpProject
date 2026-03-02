-- Add schedule category to distinguish study schedule vs exam schedule
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'ScheduleCategory'
  ) THEN
    CREATE TYPE "ScheduleCategory" AS ENUM ('STUDY', 'EXAM');
  END IF;
END
$$;

ALTER TABLE "class_schedule"
ADD COLUMN IF NOT EXISTS "category" "ScheduleCategory" NOT NULL DEFAULT 'STUDY';

-- Backfill existing data: keep EXAM rows clearly marked as EXAM category
UPDATE "class_schedule"
SET "category" = 'EXAM'
WHERE "type" = 'EXAM'
  AND "category" = 'STUDY';
