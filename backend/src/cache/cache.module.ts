import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [
    NestCacheModule.register({
      ttl: 60_000,
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
