-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- Create enum if not exists (idempotent)
DO $$
BEGIN
  CREATE TYPE "public"."ReportStatus" AS ENUM ('ANALYZING', 'COMPLETED', 'PENDING');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- Change reports.status from VARCHAR to enum ReportStatus
ALTER TABLE "public"."reports"
  ALTER COLUMN "status" TYPE "public"."ReportStatus"
  USING ("status"::"public"."ReportStatus");

-- Update questions table: add order, relax NOT NULL constraints
ALTER TABLE "public"."questions"
  ADD COLUMN IF NOT EXISTS "order" INTEGER,
  ALTER COLUMN "sample_answer" DROP NOT NULL,
  ALTER COLUMN "user_answer" DROP NOT NULL,
  ALTER COLUMN "recording" DROP NOT NULL;

