import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      return this.redis.set(key, value, 'EX', ttl);
    }

    return this.redis.set(key, value);
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async delete(key: string) {
    return this.redis.del(key);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
