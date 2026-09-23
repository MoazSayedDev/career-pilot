import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';
import { GeminiModule } from '../gemini/gemini.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsageModule } from '../usage/usage.module';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { RedisModule } from 'src/cache/redis/redis.module';

@Module({
  imports: [PrismaModule, AiModule, GeminiModule, UsageModule, RedisModule],
  controllers: [ResumeController],
  providers: [ResumeService],
  exports: [ResumeService],
})
export class ResumeModule {}
