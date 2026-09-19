import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { RedisModule } from 'src/cache/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [CertificateController],
  providers: [CertificateService],
})
export class CertificateModule {}
