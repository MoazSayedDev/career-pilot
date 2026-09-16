import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '@prisma/client';
import Stripe from 'stripe';
import {
  CheckoutRequest,
  CheckoutResult,
  PaymentProviderService,
  VerifiedPaymentEvent,
} from '../../payment-provider.interface';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class StripeProvider implements PaymentProviderService {
  readonly provider = PaymentProvider.STRIPE;
  private readonly stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.config.getOrThrow<string>('STRIPE_SECRET_KEY'));
  }

  async createCheckoutSession(request: CheckoutRequest): Promise<CheckoutResult> {
    const mapping = await this.prisma.planProviderPrice.findUnique({
      where: {
        planId_provider_interval: {
          planId: request.planId,
          provider: PaymentProvider.STRIPE,
          interval: request.interval,
        },
      },
    });
    if (!mapping) {
      throw new InternalServerErrorException('No Stripe price is configured for this plan');
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: mapping.externalId, quantity: 1 }],
      customer_email: request.userEmail,
      client_reference_id: request.paymentId,
      metadata: { paymentId: request.paymentId, planId: request.planId },
      success_url: this.config.getOrThrow<string>('STRIPE_SUCCESS_URL'),
      cancel_url: this.config.getOrThrow<string>('STRIPE_CANCEL_URL'),
    });

    return { sessionId: session.id, url: session.url, providerPaymentId: session.id };
  }

  async cancelSubscription(providerSubscriptionId: string) {
    await this.stripe.subscriptions.update(providerSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  verifyWebhook(rawBody: Buffer, signature: string): VerifiedPaymentEvent[] {
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET'),
    );
    const object = event.data.object as Stripe.Checkout.Session & {
      metadata?: Record<string, string>;
    };
    const metadata = object.metadata;
    if (event.type === 'checkout.session.completed') {
      return [{
        type: 'succeeded',
        providerPaymentId: object.id,
        paymentId: metadata?.paymentId,
        planId: metadata?.planId,
        subscriptionId: typeof object.subscription === 'string' ? object.subscription : undefined,
      }];
    }
    if (event.type === 'checkout.session.async_payment_failed') {
      return [{ type: 'failed', providerPaymentId: object.id, paymentId: metadata?.paymentId }];
    }
    if (event.type === 'customer.subscription.deleted') {
      return [{ type: 'subscription_canceled', providerPaymentId: object.id, subscriptionId: object.id }];
    }
    return [];
  }
}
