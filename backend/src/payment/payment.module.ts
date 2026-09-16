import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentProviderRegistry } from './payment-provider.registry';
import { StripeProvider } from './providers/stripe/stripe.provider';

@Module({
  imports: [PrismaModule, forwardRef(() => SubscriptionModule)],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentProviderRegistry,
    StripeProvider,
    {
      provide: 'REGISTER_PAYMENT_PROVIDERS',
      inject: [PaymentProviderRegistry, StripeProvider],
      useFactory: (registry: PaymentProviderRegistry, stripe: StripeProvider) => {
        registry.register(stripe);
      },
    },
  ],
  exports: [PaymentProviderRegistry, PaymentService],
})
export class PaymentModule {}