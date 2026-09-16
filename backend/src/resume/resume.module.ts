import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { AiModule } from 'src/ai/ai.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports: [PrismaModule, AiModule, SubscriptionModule],
  controllers: [ResumeController],
  providers: [ResumeService],
  exports: [ResumeService],
})
export class ResumeModule {}
