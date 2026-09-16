import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentProvider } from '@prisma/client';
import { PaymentProviderService } from './payment-provider.interface';

@Injectable()
export class PaymentProviderRegistry {
  private readonly providers = new Map<PaymentProvider, PaymentProviderService>();

  register(provider: PaymentProviderService) {
    this.providers.set(provider.provider, provider);
  }

  get(provider: PaymentProvider) {
    const implementation = this.providers.get(provider);
    if (!implementation) {
      throw new NotFoundException(`Payment provider ${provider} is not configured`);
    }
    return implementation;
  }
}
