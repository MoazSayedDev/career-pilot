import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

import { RedisService } from 'src/cache/redis/redis.service';

@Injectable()
export class CertificateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  private getProfileCacheKey(userId: string): string {
    return `career-pilot:profile:${userId}`;
  }

  /**
   * Creates a certificate for the authenticated user's profile.
   *
   * @param userId - The ID of the authenticated user.
   * @param dto - Certificate data to be created.
   * @returns The newly created certificate.
   *
   * @throws NotFoundException If the user's profile does not exist.
   */
  async create(userId: string, dto: CreateCertificateDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const certificate = await this.prisma.certificate.create({
      data: {
        ...dto,
        profileId: profile.id,
      },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));

    return certificate;
  }

  /**
   * Retrieves all certificates belonging to the authenticated user.
   *
   * Certificates are ordered by issue date, with the most recent
   * certificate returned first.
   *
   * @param userId - The ID of the authenticated user.
   * @returns A list of the user's certificates.
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

    return this.prisma.certificate.findMany({
      where: { profileId: profile.id },
      orderBy: { issueDate: 'desc' },
    });
  }

  /**
   * Retrieves a specific certificate belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param certificateId - The ID of the certificate to retrieve.
   * @returns The requested certificate.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the certificate does not exist
   * or does not belong to the authenticated user.
   */
  async findOne(userId: string, certificateId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const certificate = await this.prisma.certificate.findFirst({
      where: { profileId: profile.id, id: certificateId },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  /**
   * Updates a certificate belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param certificateId - The ID of the certificate to update.
   * @param dto - Updated certificate data.
   * @returns The updated certificate.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the certificate does not exist
   * or does not belong to the authenticated user.
   */
  async update(
    userId: string,
    certificateId: string,
    dto: UpdateCertificateDto,
  ) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const certificate = await this.prisma.certificate.findFirst({
      where: { profileId: profile.id, id: certificateId },
      select: { id: true },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    const updatedCertificate = await this.prisma.certificate.update({
      where: { id: certificate.id },
      data: dto,
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));

    return updatedCertificate;
  }

  /**
   * Deletes a certificate belonging to the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @param certificateId - The ID of the certificate to delete.
   * @returns The deleted certificate.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws NotFoundException If the certificate does not exist
   * or does not belong to the authenticated user.
   */
  async remove(userId: string, certificateId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const certificate = await this.prisma.certificate.findFirst({
      where: { profileId: profile.id, id: certificateId },
      select: { id: true },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    const deletedCertificate = await this.prisma.certificate.delete({
      where: { id: certificate.id },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));

    return deletedCertificate;
  }
}
