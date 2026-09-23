import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateContactInfoDto,
  CreateProfileLinkDto,
} from './dto/create-contact-info.dto';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';

import { RedisService } from 'src/cache/redis/redis.service';

@Injectable()
export class ContactInfoService {
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
   * Creates contact information for the authenticated user's profile.
   *
   * @param userId - The ID of the authenticated user.
   * @param dto - Contact information data including optional profile links.
   * @returns The newly created contact information with its profile links.
   *
   * @throws NotFoundException If the user's profile does not exist.
   * @throws ConflictException If contact information already exists for the profile.
   */
  async create(userId: string, dto: CreateContactInfoDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        id: true,
        contactInfo: {
          select: { id: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.contactInfo) {
      throw new ConflictException('Contact info already exists');
    }

    const { links, ...contactInfoData } = dto;

    this.validateUniqueLinkTypes(links);

    const contactInfo = await this.prisma.contactInfo.create({
      data: {
        ...contactInfoData,
        profileId: profile.id,
        links: links
          ? {
              create: links,
            }
          : undefined,
      },
      include: {
        links: true,
      },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));
    await this.redisService.deleteByPattern(this.getResumeCachePattern(userId));

    return contactInfo;
  }

  /**
   * Retrieves the contact information of the authenticated user.
   *
   * @param userId - The ID of the authenticated user.
   * @returns The user's contact information with its profile links.
   *
   * @throws NotFoundException If contact information does not exist.
   */
  async findMyContactInfo(userId: string) {
    const contactInfo = await this.prisma.contactInfo.findFirst({
      where: {
        profile: { userId },
      },
      include: {
        links: true,
      },
    });

    if (!contactInfo) {
      throw new NotFoundException('Contact info not found');
    }

    return contactInfo;
  }

  /**
   * Updates the contact information of the authenticated user.
   *
   * When links are provided, all existing profile links are replaced
   * with the new links.
   *
   * @param userId - The ID of the authenticated user.
   * @param dto - Updated contact information data.
   * @returns The updated contact information with its profile links.
   *
   * @throws NotFoundException If contact information does not exist.
   */
  async update(userId: string, dto: UpdateContactInfoDto) {
    const contactInfo = await this.prisma.contactInfo.findFirst({
      where: {
        profile: { userId },
      },
      select: {
        id: true,
      },
    });

    if (!contactInfo) {
      throw new NotFoundException('Contact info not found');
    }

    const { links, ...contactInfoData } = dto;

    this.validateUniqueLinkTypes(links);

    const updatedContactInfo = await this.prisma.contactInfo.update({
      where: {
        id: contactInfo.id,
      },
      data: {
        ...contactInfoData,

        ...(links !== undefined && {
          links: {
            deleteMany: {},
            create: links,
          },
        }),
      },
      include: {
        links: true,
      },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));
    await this.redisService.deleteByPattern(this.getResumeCachePattern(userId));

    return updatedContactInfo;
  }

  /**
   * Deletes the contact information of the authenticated user.
   *
   * Associated profile links are automatically deleted because
   * the ProfileLink relation uses cascade deletion.
   *
   * @param userId - The ID of the authenticated user.
   * @returns The deleted contact information.
   *
   * @throws NotFoundException If contact information does not exist.
   */
  async remove(userId: string) {
    const contactInfo = await this.prisma.contactInfo.findFirst({
      where: {
        profile: { userId },
      },
      select: {
        id: true,
      },
    });

    if (!contactInfo) {
      throw new NotFoundException('Contact info not found');
    }

    const deletedContactInfo = await this.prisma.contactInfo.delete({
      where: {
        id: contactInfo.id,
      },
    });

    await this.redisService.delete(this.getProfileCacheKey(userId));
    await this.redisService.deleteByPattern(this.getResumeCachePattern(userId));

    return deletedContactInfo;
  }

  /**
   *
   * @param links
   * @returns
   */
  private validateUniqueLinkTypes(links?: CreateProfileLinkDto[]) {
    if (!links) return;

    const types = links.map((link) => link.type);

    if (new Set(types).size !== types.length) {
      throw new ConflictException('Each link type can only be added once');
    }
  }
}
