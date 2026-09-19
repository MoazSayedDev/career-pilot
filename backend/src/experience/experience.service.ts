import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { RedisService } from 'src/cache/redis/redis.service';

@Injectable()
export class ExperienceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  private getProfileCacheKey(userId: string): string {
    return `career-pilot:profile:${userId}`;
  }

  /**
   * Creates a work experience record for the authenticated user's profile.
   *
   * @param userId - The ID of the authenticated user.
   * @param dto - Work experience data to be created.
   * @returns The newly created experience record.
   *
   * @throws NotFoundException If the user's profile does not exist.
   */
  async create(userId: string, dto: CreateExperienceDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const experience = await this.prisma.experience.create({
      data: {
        ...dto,
        profileId: profile.id,
      },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));

    return experience;
  }

  /**
   * Retrieves all work experience records belonging to the authenticated user.
   *
   * Experiences are ordered by start date, with the most recent
   * experience returned first.
   *
   * @param userId - The ID of the authenticated user.
   * @returns A list of the user's work experiences.
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

    return this.prisma.experience.findMany({
      where: { profileId: profile.id },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Retrieves a specific work experience belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param experienceId - The ID of the experience record to retrieve.
   * @returns The requested experience record.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the experience does not exist
   * or does not belong to the authenticated user.
   */
  async findOne(userId: string, experienceId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const experience = await this.prisma.experience.findFirst({
      where: {
        profileId: profile.id,
        id: experienceId,
      },
    });

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    return experience;
  }

  /**
   * Updates a work experience belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param experienceId - The ID of the experience record to update.
   * @param dto - Updated work experience data.
   * @returns The updated experience record.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the experience does not exist
   * or does not belong to the authenticated user.
   */
  async update(userId: string, experienceId: string, dto: UpdateExperienceDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const experience = await this.prisma.experience.findFirst({
      where: { profileId: profile.id, id: experienceId },
      select: { id: true },
    });

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    const updatedExperience = await this.prisma.experience.update({
      where: { id: experience.id },
      data: dto,
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));

    return updatedExperience;
  }

  /**
   * Deletes a work experience belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param experienceId - The ID of the experience record to delete.
   * @returns The deleted experience record.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the experience does not exist
   * or does not belong to the authenticated user.
   */
  async remove(userId: string, experienceId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const experience = await this.prisma.experience.findFirst({
      where: { profileId: profile.id, id: experienceId },
      select: { id: true },
    });

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    const deletedExperience = await this.prisma.experience.delete({
      where: { id: experience.id },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));

    return deletedExperience;
  }
}
