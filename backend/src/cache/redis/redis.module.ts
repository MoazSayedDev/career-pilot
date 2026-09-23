import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        });

        redis.on('ready', () => {
          console.log('✅ Redis is ready');
        });

        redis.on('error', (error) => {
          console.error('❌ Redis error:', error.message);
        });

        return redis;
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
