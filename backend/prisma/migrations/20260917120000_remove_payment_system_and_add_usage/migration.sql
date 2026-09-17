-- Remove payment and subscription artifacts
DROP TABLE IF EXISTS "Payment";
DROP TABLE IF EXISTS "PlanProviderPrice";
DROP TABLE IF EXISTS "Subscription";
DROP TABLE IF EXISTS "Plan";
DROP TYPE IF EXISTS "PaymentStatus";
DROP TYPE IF EXISTS "PaymentProvider";
DROP TYPE IF EXISTS "SubscriptionStatus";
DROP TYPE IF EXISTS "PlanInterval";

-- Add per-user monthly usage tracking and encrypted Gemini key field
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "encryptedGeminiApiKey" TEXT;

ALTER TABLE "Usage"
  ADD COLUMN IF NOT EXISTS "month" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cvGenerations" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "jobDescriptions" INTEGER NOT NULL DEFAULT 0;

UPDATE "Usage"
SET "month" = date_trunc('month', "periodStart")
WHERE "month" IS NULL AND "periodStart" IS NOT NULL;

ALTER TABLE "Usage"
  ALTER COLUMN "month" SET NOT NULL;

ALTER TABLE "Usage"
  DROP COLUMN IF EXISTS "cvUsed",
  DROP COLUMN IF EXISTS "jobDescriptionUsed",
  DROP COLUMN IF EXISTS "periodStart",
  DROP COLUMN IF EXISTS "periodEnd";

DROP INDEX IF EXISTS "Usage_userId_periodStart_key";
CREATE UNIQUE INDEX "Usage_userId_month_key"
  ON "Usage"("userId", "month");
