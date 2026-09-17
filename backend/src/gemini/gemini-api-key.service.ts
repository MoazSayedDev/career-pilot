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

  /**
   * Encrypts a Gemini API key for secure storage.
   *
   * @param apiKey - The Gemini API key to encrypt.
   * @returns The encrypted API key containing the IV, authentication tag, and ciphertext.
   * @throws BadRequestException If the API key is empty.
   * @throws InternalServerErrorException If the encryption key is not configured.
   */
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

  /**
   * Decrypts a stored Gemini API key.
   *
   * @param encryptedApiKey - The encrypted Gemini API key to decrypt.
   * @returns The decrypted Gemini API key.
   * @throws BadRequestException If the encrypted API key is empty.
   * @throws InternalServerErrorException If the stored encrypted value is invalid
   * or the encryption key is not configured.
   */
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

  /**
   * Retrieves and decrypts a user's personal Gemini API key.
   *
   * @param userId - The ID of the user.
   * @returns The decrypted personal API key, or `null` when none is configured.
   */
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

  /**
   * Resolves the Gemini API key available to a user.
   *
   * @param userId - The ID of the user.
   * @returns The user's personal key, the server key, or `null` when no key is configured.
   */
  async getEffectiveGeminiApiKey(userId: string): Promise<string | null> {
    const userKey = await this.getUserGeminiApiKey(userId);
    if (userKey) {
      return userKey;
    }

    return this.configService.get<string>('GEMINI_API_KEY') ?? null;
  }

  /**
   * Checks whether a user has a personal Gemini API key configured.
   *
   * @param userId - The ID of the user.
   * @returns `true` when the user has a stored personal key.
   */
  async hasConfiguredGeminiKey(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { encryptedGeminiApiKey: true },
    });

    return Boolean(user?.encryptedGeminiApiKey);
  }

  /**
   * Stores an encrypted Gemini API key for a user.
   *
   * @param userId - The ID of the user.
   * @param encryptedApiKey - The encrypted Gemini API key to store.
   * @returns A promise that resolves when the key has been stored.
   */
  async setUserGeminiApiKey(
    userId: string,
    encryptedApiKey: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { encryptedGeminiApiKey: encryptedApiKey },
    });
  }

  /**
   * Removes a user's stored Gemini API key.
   *
   * @param userId - The ID of the user.
   * @returns A promise that resolves when the key has been removed.
   */
  async clearUserGeminiApiKey(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { encryptedGeminiApiKey: null },
    });
  }
}
