import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ExperienceController } from './experience.controller';
import { ExperienceService } from './experience.service';
import { RedisModule } from 'src/cache/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [ExperienceController],
  providers: [ExperienceService],
})
export class ExperienceModule {}
