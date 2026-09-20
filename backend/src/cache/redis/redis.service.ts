import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async set(key: string, value: string, ttl?: number): Promise<'OK' | null> {
    console.log('set ');
    if (ttl) {
      return this.redis.set(key, value, 'EX', ttl);
    }

    return this.redis.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    console.log('get ');
    return this.redis.get(key);
  }

  async delete(key: string): Promise<number> {
    console.log('del');
    return this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    console.log('exist');
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async setJson<T>(key: string, value: T, ttl?: number): Promise<'OK' | null> {
    console.log('set json');
    return this.set(key, JSON.stringify(value), ttl);
  }

  async getJson<T>(key: string): Promise<T | null> {
    console.log('get json ');
    const value = await this.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  async deleteByPattern(pattern: string): Promise<void> {
    console.log('del pattern');
    let cursor = '0';

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );

      cursor = nextCursor;

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== '0');
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
