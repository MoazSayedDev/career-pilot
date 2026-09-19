import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { RedisService } from 'src/cache/redis/redis.service';

@Injectable()
export class SkillService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  private getProfileCacheKey(userId: string): string {
    return `career-pilot:profile:${userId}`;
  }

  /**
   * Creates a new skill for the authenticated user's profile.
   *
   * @param userId - The ID of the authenticated user.
   * @param dto - The skill data to create.
   * @returns The newly created skill.
   *
   * @throws NotFoundException If the user's profile does not exist.
   */
  async create(userId: string, dto: CreateSkillDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const skill = await this.prisma.skill.create({
      data: {
        ...dto,
        profileId: profile.id,
      },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));

    return skill;
  }

  /**
   * Retrieves all skills belonging to the authenticated user's profile.
   *
   * @param userId - The ID of the authenticated user.
   * @returns A list of the user's skills.
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

    return this.prisma.skill.findMany({
      where: { profileId: profile.id },
    });
  }

  /**
   * Retrieves a specific skill belonging to the authenticated user's profile.
   *
   * @param userId - The ID of the authenticated user.
   * @param skillId - The ID of the skill to retrieve.
   * @returns The requested skill.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the skill does not exist or does not belong to the user.
   */
  async findOne(userId: string, skillId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const skill = await this.prisma.skill.findFirst({
      where: { profileId: profile.id, id: skillId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  /**
   * Updates a specific skill belonging to the authenticated user's profile.
   *
   * @param userId - The ID of the authenticated user.
   * @param skillId - The ID of the skill to update.
   * @param dto - The updated skill data.
   * @returns The updated skill.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the skill does not exist or does not belong to the user.
   */
  async update(userId: string, skillId: string, dto: UpdateSkillDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const skill = await this.prisma.skill.findFirst({
      where: { profileId: profile.id, id: skillId },
      select: { id: true },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const updatedSkill = await this.prisma.skill.update({
      where: { id: skill.id },
      data: dto,
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));

    return updatedSkill;
  }

  /**
   * Deletes a specific skill belonging to the authenticated user's profile.
   *
   * @param userId - The ID of the authenticated user.
   * @param skillId - The ID of the skill to delete.
   * @returns The deleted skill.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the skill does not exist or does not belong to the user.
   */
  async remove(userId: string, skillId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const skill = await this.prisma.skill.findFirst({
      where: { profileId: profile.id, id: skillId },
      select: { id: true },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const deletedSkill = await this.prisma.skill.delete({
      where: { id: skill.id },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));

    return deletedSkill;
  }
}
