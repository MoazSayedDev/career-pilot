CREATE TABLE "PlanProviderPrice" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "interval" "PlanInterval" NOT NULL,
    "externalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlanProviderPrice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlanProviderPrice_planId_provider_interval_key"
  ON "PlanProviderPrice"("planId", "provider", "interval");
CREATE UNIQUE INDEX "PlanProviderPrice_provider_externalId_key"
  ON "PlanProviderPrice"("provider", "externalId");
CREATE INDEX "PlanProviderPrice_planId_idx" ON "PlanProviderPrice"("planId");
ALTER TABLE "PlanProviderPrice"
  ADD CONSTRAINT "PlanProviderPrice_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
