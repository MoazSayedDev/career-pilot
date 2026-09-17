import { ForbiddenException, Injectable } from '@nestjs/common';

import {
  CV_MONTHLY_LIMIT,
  JOB_DESCRIPTION_MONTHLY_LIMIT,
} from './usage.constants';
import { PrismaService } from '../prisma/prisma.service';

export type UsageType = 'cv' | 'jobDescription';

@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  private getCurrentMonthStart(date = new Date()): Date {
    const normalized = new Date(date);
    return new Date(
      Date.UTC(
        normalized.getUTCFullYear(),
        normalized.getUTCMonth(),
        1,
        0,
        0,
        0,
        0,
      ),
    );
  }

  private async getOrCreateUsageRecord(userId: string, month: Date) {
    return this.prisma.usage.upsert({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
      create: {
        userId,
        month,
        cvGenerations: 0,
        jobDescriptions: 0,
      },
      update: {},
    });
  }

  async getCurrentUsage(userId: string) {
    const month = this.getCurrentMonthStart();
    const usage = await this.getOrCreateUsageRecord(userId, month);

    return {
      cvGenerations: {
        used: usage.cvGenerations,
        limit: CV_MONTHLY_LIMIT,
        remaining: Math.max(0, CV_MONTHLY_LIMIT - usage.cvGenerations),
      },
      jobDescriptions: {
        used: usage.jobDescriptions,
        limit: JOB_DESCRIPTION_MONTHLY_LIMIT,
        remaining: Math.max(
          0,
          JOB_DESCRIPTION_MONTHLY_LIMIT - usage.jobDescriptions,
        ),
      },
      month: usage.month,
    };
  }

  async canUseCv(userId: string): Promise<boolean> {
    const month = this.getCurrentMonthStart();
    const usage = await this.getOrCreateUsageRecord(userId, month);
    return usage.cvGenerations < CV_MONTHLY_LIMIT;
  }

  async canUseJobDescription(userId: string): Promise<boolean> {
    const month = this.getCurrentMonthStart();
    const usage = await this.getOrCreateUsageRecord(userId, month);
    return usage.jobDescriptions < JOB_DESCRIPTION_MONTHLY_LIMIT;
  }

  async consumeCv(userId: string) {
    return this.consume(userId, 'cv');
  }

  async consumeJobDescription(userId: string) {
    return this.consume(userId, 'jobDescription');
  }

  private async consume(userId: string, type: UsageType) {
    const month = this.getCurrentMonthStart();
    const field = type === 'cv' ? 'cvGenerations' : 'jobDescriptions';
    const limit =
      type === 'cv' ? CV_MONTHLY_LIMIT : JOB_DESCRIPTION_MONTHLY_LIMIT;
    const label = type === 'cv' ? 'CV' : 'Job description';

    await this.getOrCreateUsageRecord(userId, month);

    const updateResult = await this.prisma.usage.updateMany({
      where: {
        userId,
        month,
        [field]: {
          lt: limit,
        },
      },
      data: {
        [field]: {
          increment: 1,
        },
      },
    });

    if (updateResult.count === 0) {
      throw new ForbiddenException(`${label} monthly limit reached.`);
    }

    const updatedUsage = await this.prisma.usage.findUniqueOrThrow({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    return updatedUsage;
  }
}
