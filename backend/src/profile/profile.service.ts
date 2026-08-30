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

import type { Cache } from 'cache-manager';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

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

    return this.prisma.profile.create({
      data: {
        ...dto,
        userId,
      },
    });
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

    return this.prisma.profile.update({
      where: { userId },
      data: {
        ...dto,
      },
    });
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

    return this.prisma.profile.delete({
      where: { userId },
    });
  }
}
