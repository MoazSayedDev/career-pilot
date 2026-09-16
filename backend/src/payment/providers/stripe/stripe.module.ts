import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeController } from './stripe.controller';
import { StripeProvider } from './stripe.provider';

@Module({
  imports: [ConfigModule],
  controllers: [StripeController],
  providers: [StripeProvider],
  exports: [StripeProvider],
})
export class StripeModule {}
