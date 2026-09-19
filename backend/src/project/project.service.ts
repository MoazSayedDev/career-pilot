import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { RedisService } from 'src/cache/redis/redis.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}
  private getProfileCacheKey(userId: string): string {
    return `career-pilot:profile:${userId}`;
  }

  /**
   * Creates a new project for the authenticated user's profile.
   *
   * @param userId - The ID of the authenticated user.
   * @param dto - Project data to be created.
   * @returns The newly created project.
   *
   * @throws NotFoundException If the user's profile does not exist.
   */
  async create(userId: string, dto: CreateProjectDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const project = await this.prisma.project.create({
      data: {
        ...dto,
        profileId: profile.id,
      },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));

    return project;
  }

  /**
   * Retrieves all projects belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @returns A list of the user's projects.
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

    return this.prisma.project.findMany({
      where: { profileId: profile.id },
    });
  }

  /**
   * Retrieves a specific project belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param projectId - The ID of the project to retrieve.
   * @returns The requested project.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the project does not exist
   * or does not belong to the authenticated user.
   */
  async findOne(userId: string, projectId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const project = await this.prisma.project.findFirst({
      where: { profileId: profile.id, id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  /**
   * Updates a project belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param projectId - The ID of the project to update.
   * @param dto - Updated project data.
   * @returns The updated project.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the project does not exist
   * or does not belong to the authenticated user.
   */
  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const project = await this.prisma.project.findFirst({
      where: { profileId: profile.id, id: projectId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updatedProject = await this.prisma.project.update({
      where: { id: project.id },
      data: dto,
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));

    return updatedProject;
  }

  /**
   * Deletes a project belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param projectId - The ID of the project to delete.
   * @returns The deleted project.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the project does not exist
   * or does not belong to the authenticated user.
   */
  async remove(userId: string, projectId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const project = await this.prisma.project.findFirst({
      where: { profileId: profile.id, id: projectId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const deletedProject = await this.prisma.project.delete({
      where: { id: project.id },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));

    return deletedProject;
  }
}
