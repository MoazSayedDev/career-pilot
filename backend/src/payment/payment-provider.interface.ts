import { PaymentProvider, PlanInterval } from '@prisma/client';

export interface CheckoutRequest {
  paymentId: string;
  planId: string;
  planName: string;
  interval: PlanInterval;
  amount: number;
  currency: string;
  userEmail: string;
}

export interface CheckoutResult {
  sessionId: string;
  url: string | null;
  providerPaymentId: string;
}

export interface VerifiedPaymentEvent {
  type: 'succeeded' | 'failed' | 'refunded' | 'subscription_canceled' | 'subscription_renewed';
  providerPaymentId: string;
  paymentId?: string;
  userId?: string;
  planId?: string;
  subscriptionId?: string;
}

export interface PaymentProviderService {
  readonly provider: PaymentProvider;
  createCheckoutSession(request: CheckoutRequest): Promise<CheckoutResult>;
  cancelSubscription(providerSubscriptionId: string): Promise<void>;
  verifyWebhook(rawBody: Buffer, signature: string): VerifiedPaymentEvent[];
}
