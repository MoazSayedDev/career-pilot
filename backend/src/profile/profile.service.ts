import {
  ConflictException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { RedisService } from 'src/cache/redis/redis.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  private getProfileCacheKey(userId: string): string {
    return `career-pilot:profile:${userId}`;
  }

  private getResumeCachePattern(userId: string): string {
    return `resume:${userId}:*`;
  }

  /**
   * Creates a profile for the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param dto - Profile data to be created.
   * @returns The newly created profile.
   *
   * @throws ConflictException If a profile already exists for the user.
   */
  async create(userId: string, dto: CreateProfileDto) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('Profile already exists');
    }

    const createdProfile = this.prisma.profile.create({
      data: {
        ...dto,
        userId,
      },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));
    await this.redisService.deleteByPattern(this.getResumeCachePattern(userId));

    return createdProfile;
  }

  /**
   * Retrieves the complete profile of the authenticated user.
   *
   * Includes contact information, profile links, skills, experiences,
   * projects, education, certificates, and languages.
   *
   * @param userId - The ID of the authenticated user.
   * @returns The user's complete profile.
   *
   * @throws NotFoundException If the profile does not exist.
   */
  async findMe(userId: string) {
    const cacheKey = this.getProfileCacheKey(userId);

    const cachedProfile = await this.redisService.getJson(cacheKey);

    if (cachedProfile) {
      return cachedProfile;
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        contactInfo: {
          include: {
            links: true,
          },
        },
        skills: true,
        experiences: {
          orderBy: {
            startDate: 'desc',
          },
        },
        certificates: {
          orderBy: {
            issueDate: 'desc',
          },
        },
        educations: {
          orderBy: {
            startDate: 'desc',
          },
        },
        projects: true,
        languages: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    await this.redisService.setJson(cacheKey, profile, 60);

    return profile;
  }

  /**
   * Updates the profile of the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param dto - Updated profile data.
   * @returns The updated profile.
   *
   * @throws NotFoundException If the profile does not exist.
   */
  async update(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const updatedProfile = await this.prisma.profile.update({
      where: { userId },
      data: {
        ...dto,
      },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));
    await this.redisService.deleteByPattern(this.getResumeCachePattern(userId));

    return updatedProfile;
  }

  /**
   * Deletes the profile of the authenticated user.
   *
   * Related profile data is automatically deleted according
   * to the configured cascade delete relations.
   *
   * @param userId - The ID of the authenticated user.
   * @returns The deleted profile.
   *
   * @throws NotFoundException If the profile does not exist.
   */
  async remove(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const deletedProfile = this.prisma.profile.delete({
      where: { userId },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));
    await this.redisService.deleteByPattern(this.getResumeCachePattern(userId));

    return deletedProfile;
  }
}
