import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { RedisModule } from 'src/cache/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [SkillController],
  providers: [SkillService],
})
export class SkillModule {}
