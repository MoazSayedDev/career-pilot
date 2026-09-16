import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  PaymentProvider,
  PaymentStatus,
  PlanInterval,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { PaymentProviderRegistry } from './payment-provider.registry';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providers: PaymentProviderRegistry,
    private readonly subscriptions: SubscriptionService,
  ) {}

  async createCheckout(
    userId: string,
    userEmail: string,
    plan: {
      id: string;
      name: string;
      price: Prisma.Decimal;
      currency: string;
      interval: PlanInterval;
    },
  ) {
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: plan.price,
        currency: plan.currency,
        provider: PaymentProvider.STRIPE,
        status: PaymentStatus.PENDING,
      },
    });
    try {
      const result = await this.providers
        .get(PaymentProvider.STRIPE)
        .createCheckoutSession({
          paymentId: payment.id,
          planId: plan.id,
          planName: plan.name,
          interval: plan.interval,
          amount: plan.price.toNumber(),
          currency: plan.currency,
          userEmail,
        });
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { providerPaymentId: result.providerPaymentId },
      });
      return {
        paymentId: payment.id,
        status: PaymentStatus.PENDING,
        sessionId: result.sessionId,
        url: result.url,
      };
    } catch (error) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      throw error;
    }
  }

  async handleStripeWebhook(rawBody: Buffer | undefined, signature: string) {
    console.log('🔥🔥🔥 STRIPE WEBHOOK HIT 🔥🔥🔥');

    console.log('rawBody exists:', !!rawBody);
    console.log('signature:', signature);

    if (!rawBody || !signature) {
      throw new InternalServerErrorException('Invalid Stripe webhook request');
    }
    const events = this.providers
      .get(PaymentProvider.STRIPE)
      .verifyWebhook(rawBody, signature);
    for (const event of events) {
      if (event.type === 'succeeded' && event.paymentId) {
        await this.subscriptions.activatePaidSubscription(
          event.paymentId,
          event.providerPaymentId,
          event.planId,
          event.subscriptionId,
        );
      } else if (
        event.type === 'subscription_canceled' &&
        event.subscriptionId
      ) {
        await this.subscriptions.markProviderSubscriptionCanceled(
          event.subscriptionId,
        );
      } else if (event.type === 'failed' && event.paymentId) {
        await this.prisma.payment.updateMany({
          where: { id: event.paymentId, status: PaymentStatus.PENDING },
          data: { status: PaymentStatus.FAILED },
        });
      }
    }
    return { received: true };
  }
}
