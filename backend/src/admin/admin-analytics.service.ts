import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}


  /**
   * Get an overview of the application's analytics.
   * @returns An object containing the analytics data.
   */
  async getOverview() {
    const [
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      totalResumes,
    ] = await Promise.all([
      this.prisma.user.count(),

      this.prisma.user.count({
        where: {
          isVerified: true,
        },
      }),

      this.prisma.user.count({
        where: {
          isVerified: false,
        },
      }),

      this.prisma.resume.count(),
    ]);

    const usersWithResumes = await this.prisma.user.count({
      where: {
        profile: {
          resumes: {
            some: {},
          },
        },
      },
    });

    return {
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      usersWithResumes,
      usersWithoutResumes: totalUsers - usersWithResumes,
      totalResumes,
    };
  }


  /**
   * Get all users.
   * @returns A list of all users.
   */
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isVerified: true,
        createdAt: true,

        profile: {
          select: {
            id: true,

            _count: {
              select: {
                resumes: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,

      resumeCount: user.profile?._count.resumes ?? 0,
    }));
  }

  /**
   * Get all verified users.
   * @returns A list of verified users.
   */
  async getVerifiedUsers() {
    return this.prisma.user.findMany({
      where: {
        isVerified: true,
      },

      select: {
        id: true,
        username: true,
        email: true,
        isVerified: true,
        createdAt: true,

        profile: {
          select: {
            _count: {
              select: {
                resumes: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }


  /**
   * Get all unverified users.
   * @returns A list of unverified users.
   */
  async getUnverifiedUsers() {
    return this.prisma.user.findMany({
      where: {
        isVerified: false,
      },

      select: {
        id: true,
        username: true,
        email: true,
        isVerified: true,
        createdAt: true,

        profile: {
          select: {
            _count: {
              select: {
                resumes: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}