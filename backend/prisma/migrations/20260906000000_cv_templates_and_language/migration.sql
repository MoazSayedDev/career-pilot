-- CreateEnum
CREATE TYPE "CvLanguage" AS ENUM ('EN', 'AR');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ResumeTemplate" ADD VALUE 'ATS_SAFE';
ALTER TYPE "ResumeTemplate" ADD VALUE 'EXECUTIVE';
ALTER TYPE "ResumeTemplate" ADD VALUE 'TECHNICAL';
ALTER TYPE "ResumeTemplate" ADD VALUE 'ELEGANT';
ALTER TYPE "ResumeTemplate" ADD VALUE 'COMPACT';

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "language" "CvLanguage" NOT NULL DEFAULT 'EN';

