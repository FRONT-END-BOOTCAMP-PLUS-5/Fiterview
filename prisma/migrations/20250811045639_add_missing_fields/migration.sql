/*
  Warnings:

  - Changed the type of `status` on the `reports` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('ANALYZING', 'COMPLETED', 'PENDING');

-- AlterTable
ALTER TABLE "public"."questions" ADD COLUMN     "order" INTEGER,
ALTER COLUMN "sample_answer" DROP NOT NULL,
ALTER COLUMN "user_answer" DROP NOT NULL,
ALTER COLUMN "recording" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."reports" DROP COLUMN "status",
ADD COLUMN     "status" "public"."ReportStatus" NOT NULL;
