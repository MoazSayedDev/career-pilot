import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { RedisService } from 'src/cache/redis/redis.service';

@Injectable()
export class LanguageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  private getProfileCacheKey(userId: string): string {
    return `career-pilot:profile:${userId}`;
  }

  private getResumeCachePattern(userId: string): string {
    return `resume:${userId}:*`;
  }

  /**
   * Creates a language record for the authenticated user's profile.
   *
   * @param userId - The ID of the authenticated user.
   * @param dto - Language data to be created.
   * @returns The newly created language record.
   *
   * @throws NotFoundException If the user's profile does not exist.
   */
  async create(userId: string, dto: CreateLanguageDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const language = await this.prisma.language.create({
      data: {
        ...dto,
        profileId: profile.id,
      },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));
    await this.redisService.deleteByPattern(this.getResumeCachePattern(userId));

    return language;
  }

  /**
   * Retrieves all language records belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @returns A list of the user's languages.
   *
   * @throws NotFoundException If the user's profile does not exist.
   */
  async findAll(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.language.findMany({
      where: { profileId: profile.id },
    });
  }

  /**
   * Updates a language record belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param languageId - The ID of the language record to update.
   * @param dto - Updated language data.
   * @returns The updated language record.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the language does not exist
   * or does not belong to the authenticated user.
   */
  async update(userId: string, languageId: string, dto: UpdateLanguageDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const language = await this.prisma.language.findFirst({
      where: { profileId: profile.id, id: languageId },
      select: { id: true },
    });

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    const updatedLanguage = await this.prisma.language.update({
      where: { id: language.id },
      data: dto,
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));
    await this.redisService.deleteByPattern(this.getResumeCachePattern(userId));

    return updatedLanguage;
  }

  /**
   * Retrieves a specific language belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param languageId - The ID of the language record to retrieve.
   * @returns The requested language record.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the language does not exist
   * or does not belong to the authenticated user.
   */
  async findOne(userId: string, languageId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const language = await this.prisma.language.findFirst({
      where: { profileId: profile.id, id: languageId },
    });

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    return language;
  }

  /**
   * Deletes a language record belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param languageId - The ID of the language record to delete.
   * @returns The deleted language record.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the language does not exist
   * or does not belong to the authenticated user.
   */
  async remove(userId: string, languageId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const language = await this.prisma.language.findFirst({
      where: { profileId: profile.id, id: languageId },
      select: { id: true },
    });

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    const deletedLanguage = await this.prisma.language.delete({
      where: { id: language.id },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));
    await this.redisService.deleteByPattern(this.getResumeCachePattern(userId));

    return deletedLanguage;
  }
}
