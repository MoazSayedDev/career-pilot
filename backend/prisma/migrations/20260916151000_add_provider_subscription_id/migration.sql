ALTER TABLE "Subscription" ADD COLUMN "providerSubscriptionId" TEXT;
CREATE UNIQUE INDEX "Subscription_providerSubscriptionId_key"
  ON "Subscription"("providerSubscriptionId");
