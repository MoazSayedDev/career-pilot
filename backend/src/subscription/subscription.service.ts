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
  cvLimit: 5,
  jobDescriptionLimit: 1,
};

type DatabaseClient = PrismaService | Prisma.TransactionClient;
export type UsageType = 'cv' | 'jobDescription';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

/**
 * Creates an active free subscription for a user when one does not exist.
 *
 * This method is safe to call repeatedly and can use a transaction client
 * when subscription creation must be part of a larger transaction.
 *
 * @param userId - The ID of the user receiving the subscription.
 * @param database - The Prisma client used for the operation.
 * @returns The existing or newly created free subscription.
 */
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

  /**
   * Retrieves the authenticated user's current subscription and plan.
   *
   * @param userId - The ID of the authenticated user.
   * @returns The current subscription with its plan.
   *
   * @throws ForbiddenException If the user has no active subscription.
   */
  async getCurrentSubscription(userId: string) {
    const subscription = await this.ensureCurrentSubscription(userId);
    return this.prisma.subscription.findUniqueOrThrow({
      where: { id: subscription.id },
      include: { plan: true },
    });
  }

  /**
   * Retrieves the current subscription, plan, and usage counters for a user.
   *
   * Usage is created for the current billing period when it does not exist.
   *
   * @param userId - The ID of the authenticated user.
   * @returns The current plan, subscription period, and usage.
   *
   * @throws ForbiddenException If the user has no active subscription.
   */
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

  /**
   * Consumes one unit of a usage-limited feature.
   *
   * @param userId - The ID of the authenticated user.
   * @param type - The usage type to consume.
   * @returns The updated usage record.
   *
   * @throws ForbiddenException If the user has no active subscription,
   * the feature is not included, or its limit has been reached.
   */
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

  /**
   * Starts a subscription for an active plan.
   *
   * Existing active subscriptions are canceled when the new subscription is
   * created. Paid plans are rejected until a payment provider is configured.
   *
   * @param userId - The ID of the user subscribing.
   * @param planId - The ID of the plan to subscribe to.
   * @returns The newly created subscription with its plan.
   *
   * @throws NotFoundException If the plan does not exist or is inactive.
   * @throws BadRequestException If the plan is paid and no payment provider
   * is configured.
   */
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

  /**
   * Schedules the current subscription to be canceled at period end.
   *
   * @param userId - The ID of the authenticated user.
   * @returns The updated subscription with its plan.
   *
   * @throws ForbiddenException If the user has no active subscription.
   */
  async cancelAtPeriodEnd(userId: string) {
    const subscription = await this.ensureCurrentSubscription(userId);
    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
      include: { plan: true },
    });
  }

  /**
   * Finds the user's active subscription and renews an expired period when
   * cancellation has not been requested.
   *
   * @param userId - The ID of the user whose subscription is needed.
   * @returns The active subscription with its plan.
   *
   * @throws ForbiddenException If the user has no active subscription or has
   * canceled the expired subscription.
   */
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

  /**
   * Retrieves usage for a billing period or creates it when absent.
   *
   * @param userId - The ID of the user whose usage is tracked.
   * @param periodStart - The start of the billing period.
   * @param periodEnd - The end of the billing period.
   * @param database - The Prisma client used for the operation.
   * @returns The existing or newly created usage record.
   */
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

  /**
   * Retrieves the existing free plan or creates the default one.
   *
   * @param database - The Prisma client used for the operation.
   * @returns The existing or newly created free plan.
   */
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

  /**
   * Calculates the end of a billing period from its start date and interval.
   *
   * @param date - The start date of the billing period.
   * @param interval - The plan billing interval.
   * @returns The calculated billing period end date.
   */
  private addInterval(date: Date, interval: PlanInterval) {
    const result = new Date(date);
    result.setMonth(
      result.getMonth() + (interval === PlanInterval.YEARLY ? 12 : 1),
    );
    return result;
  }
}
