import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlanInterval, Prisma, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const FREE_PLAN_NAME = 'Free';
const DEFAULT_FREE_PLAN = {
  description: 'Free monthly plan',
  price: 0,
  currency: 'USD',
  cvLimit: 3,
  jobDescriptionLimit: 3,
};

type DatabaseClient = PrismaService | Prisma.TransactionClient;
export type UsageType = 'cv' | 'jobDescription';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async createFreeSubscriptionForUser(
    userId: string,
    database: DatabaseClient = this.prisma,
  ) {
    const freePlan = await this.getOrCreateFreePlan(database);
    const existing = await database.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });

    if (existing) {
      return existing;
    }

    const startDate = new Date();
    const endDate = this.addInterval(startDate, PlanInterval.MONTHLY);
    return database.subscription.create({
      data: {
        userId,
        planId: freePlan.id,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
      },
      include: { plan: true },
    });
  }

  async getCurrentSubscription(userId: string) {
    const subscription = await this.ensureCurrentSubscription(userId);
    return this.prisma.subscription.findUniqueOrThrow({
      where: { id: subscription.id },
      include: { plan: true },
    });
  }

  async getCurrentUsage(userId: string) {
    const subscription = await this.ensureCurrentSubscription(userId);
    const usage = await this.getOrCreateUsage(
      userId,
      subscription.startDate,
      subscription.endDate ??
        this.addInterval(subscription.startDate, subscription.plan.interval),
    );

    return {
      plan: subscription.plan,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
      usage,
    };
  }

  async consume(userId: string, type: UsageType) {
    const subscription = await this.ensureCurrentSubscription(userId);
    const periodEnd =
      subscription.endDate ??
      this.addInterval(subscription.startDate, subscription.plan.interval);
    const usage = await this.getOrCreateUsage(
      userId,
      subscription.startDate,
      periodEnd,
    );
    const field = type === 'cv' ? 'cvUsed' : 'jobDescriptionUsed';
    const limit =
      type === 'cv'
        ? subscription.plan.cvLimit
        : subscription.plan.jobDescriptionLimit;

    if (limit <= 0) {
      throw new ForbiddenException(
        `Your ${subscription.plan.name} plan does not include ${type === 'cv' ? 'CV builds' : 'job descriptions'}.`,
      );
    }

    const updated = await this.prisma.usage.updateMany({
      where: {
        id: usage.id,
        [field]: { lt: limit },
      },
      data: {
        [field]: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new ForbiddenException(
        `You have reached your monthly ${type === 'cv' ? 'CV build' : 'job description'} limit. Please upgrade or wait for your next billing period.`,
      );
    }

    return this.prisma.usage.findUniqueOrThrow({ where: { id: usage.id } });
  }

  async subscribe(userId: string, planId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found or inactive');
    }
    if (plan.price.toNumber() > 0) {
      throw new BadRequestException(
        'Paid subscriptions require a configured payment provider.',
      );
    }

    const now = new Date();
    const endDate = this.addInterval(now, plan.interval);
    return this.prisma.$transaction(async (tx) => {
      await tx.subscription.updateMany({
        where: { userId, status: SubscriptionStatus.ACTIVE },
        data: { status: SubscriptionStatus.CANCELED, cancelAtPeriodEnd: true },
      });
      return tx.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          startDate: now,
          endDate,
        },
        include: { plan: true },
      });
    });
  }

  async cancelAtPeriodEnd(userId: string) {
    const subscription = await this.ensureCurrentSubscription(userId);
    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
      include: { plan: true },
    });
  }

  private async ensureCurrentSubscription(userId: string) {
    const now = new Date();
    let subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gt: now },
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (subscription) {
      return subscription;
    }

    const expired = await this.prisma.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      include: { plan: true },
      orderBy: { endDate: 'desc' },
    });

    if (!expired || expired.cancelAtPeriodEnd) {
      throw new ForbiddenException(
        'You do not have an active subscription. Please choose a plan.',
      );
    }

    const startDate = expired.endDate ?? now;
    const endDate = this.addInterval(startDate, expired.plan.interval);
    subscription = await this.prisma.subscription.update({
      where: { id: expired.id },
      data: { startDate, endDate, cancelAtPeriodEnd: false },
      include: { plan: true },
    });
    return subscription;
  }

  private async getOrCreateUsage(
    userId: string,
    periodStart: Date,
    periodEnd: Date,
    database: DatabaseClient = this.prisma,
  ) {
    return database.usage.upsert({
      where: {
        userId_periodStart: { userId, periodStart },
      },
      create: { userId, periodStart, periodEnd },
      update: { periodEnd },
    });
  }

  private async getOrCreateFreePlan(database: DatabaseClient) {
    const existing = await database.plan.findFirst({
      where: { name: { equals: FREE_PLAN_NAME, mode: 'insensitive' } },
    });
    if (existing) {
      return existing;
    }

    return database.plan.create({
      data: {
        name: FREE_PLAN_NAME,
        ...DEFAULT_FREE_PLAN,
        interval: PlanInterval.MONTHLY,
      },
    });
  }

  private addInterval(date: Date, interval: PlanInterval) {
    const result = new Date(date);
    result.setMonth(
      result.getMonth() + (interval === PlanInterval.YEARLY ? 12 : 1),
    );
    return result;
  }
}
