import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ProfileModule } from 'src/profile/profile.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports: [ProfileModule, PrismaModule, SubscriptionModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
