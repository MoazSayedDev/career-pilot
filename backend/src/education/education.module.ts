import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EducationController } from './education.controller';
import { EducationService } from './education.service';
import { RedisModule } from 'src/cache/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [EducationController],
  providers: [EducationService],
})
export class EducationModule {}
