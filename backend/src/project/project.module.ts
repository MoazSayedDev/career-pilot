import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { RedisModule } from 'src/cache/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
