import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeminiApiKeyService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private getEncryptionKey(): Buffer {
    const encryptionKey = this.configService.get<string>('GEMINI_ENCRYPTION_KEY');

    if (!encryptionKey || encryptionKey.trim().length === 0) {
      throw new InternalServerErrorException(
        'GEMINI_ENCRYPTION_KEY is required to encrypt user Gemini keys.',
      );
    }

    return scryptSync(encryptionKey, 'career-pilot-gemini', 32);
  }

  encrypt(apiKey: string): string {
    const normalizedKey = apiKey.trim();

    if (!normalizedKey) {
      throw new BadRequestException('Gemini API key is required.');
    }

    const iv = randomBytes(16);
    const key = this.getEncryptionKey();
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(normalizedKey, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(encryptedApiKey: string): string {
    const normalized = encryptedApiKey.trim();

    if (!normalized) {
      throw new BadRequestException('Encrypted Gemini API key is missing.');
    }

    const parts = normalized.split(':');

    if (parts.length !== 3) {
      throw new InternalServerErrorException(
        'Stored Gemini API key is invalid and could not be decrypted.',
      );
    }

    const [ivHex, tagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const key = this.getEncryptionKey();
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  async getUserGeminiApiKey(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { encryptedGeminiApiKey: true },
    });

    if (!user?.encryptedGeminiApiKey) {
      return null;
    }

    return this.decrypt(user.encryptedGeminiApiKey);
  }

  async getEffectiveGeminiApiKey(userId: string): Promise<string | null> {
    const userKey = await this.getUserGeminiApiKey(userId);
    if (userKey) {
      return userKey;
    }

    return this.configService.get<string>('GEMINI_API_KEY') ?? null;
  }

  async hasConfiguredGeminiKey(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { encryptedGeminiApiKey: true },
    });

    return Boolean(user?.encryptedGeminiApiKey);
  }

  async setUserGeminiApiKey(
    userId: string,
    encryptedApiKey: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { encryptedGeminiApiKey: encryptedApiKey },
    });
  }

  async clearUserGeminiApiKey(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { encryptedGeminiApiKey: null },
    });
  }
}
