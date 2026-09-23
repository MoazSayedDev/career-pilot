import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';
import { RedisModule } from 'src/cache/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [LanguageController],
  providers: [LanguageService],
})
export class LanguageModule {}
