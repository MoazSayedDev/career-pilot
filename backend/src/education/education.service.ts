import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';

import { RedisService } from 'src/cache/redis/redis.service';

@Injectable()
export class EducationService {
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
   * Creates an education record for the authenticated user's profile.
   *
   * @param userId - The ID of the authenticated user.
   * @param dto - Education data to be created.
   * @returns The newly created education record.
   *
   * @throws NotFoundException If the user's profile does not exist.
   */
  async create(userId: string, dto: CreateEducationDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const education = await this.prisma.education.create({
      data: {
        ...dto,
        profileId: profile.id,
      },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));
    await this.redisService.deleteByPattern(this.getResumeCachePattern(userId));

    return education;
  }

  /**
   * Retrieves all education records belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @returns A list of the user's education records.
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

    return this.prisma.education.findMany({
      where: { profileId: profile.id },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Retrieves a specific education record belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param educationId - The ID of the education record to retrieve.
   * @returns The requested education record.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the education record does not exist
   * or does not belong to the authenticated user.
   */
  async findOne(userId: string, educationId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const education = await this.prisma.education.findFirst({
      where: {
        profileId: profile.id,
        id: educationId,
      },
    });

    if (!education) {
      throw new NotFoundException('Education not found');
    }

    return education;
  }

  /**
   * Updates an education record belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param educationId - The ID of the education record to update.
   * @param dto - Updated education data.
   * @returns The updated education record.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the education record does not exist
   * or does not belong to the authenticated user.
   */
  async update(userId: string, educationId: string, dto: UpdateEducationDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const education = await this.prisma.education.findFirst({
      where: { profileId: profile.id, id: educationId },
      select: { id: true },
    });

    if (!education) {
      throw new NotFoundException('Education not found');
    }

    const updatedEducation = await this.prisma.education.update({
      where: { id: education.id },
      data: dto,
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));
    await this.redisService.deleteByPattern(this.getResumeCachePattern(userId));

    return updatedEducation;
  }

  /**
   * Deletes an education record belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param educationId - The ID of the education record to delete.
   * @returns The deleted education record.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the education record does not exist
   * or does not belong to the authenticated user.
   */
  async remove(userId: string, educationId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const education = await this.prisma.education.findFirst({
      where: { profileId: profile.id, id: educationId },
      select: { id: true },
    });

    if (!education) {
      throw new NotFoundException('Education not found');
    }

    const deletedEducation = await this.prisma.education.delete({
      where: { id: education.id },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));
    await this.redisService.deleteByPattern(this.getResumeCachePattern(userId));

    return deletedEducation;
  }
}
