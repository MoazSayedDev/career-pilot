import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PaymentProvider } from '@prisma/client';

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a subscription plan.
   *
   * @param createPlanDto - The plan details to create.
   * @returns The newly created plan.
   *
   * @throws BadRequestException If another plan has the same name.
   */
  async create(createPlanDto: CreatePlanDto) {
    const existingPlan = await this.prisma.plan.findFirst({
      where: {
        name: createPlanDto.name,
      },
    });

    if (existingPlan) {
      throw new BadRequestException('Plan with this name already exists');
    }

    const plan = await this.prisma.plan.create({
      data: {
        name: createPlanDto.name,
        description: createPlanDto.description,
        price: createPlanDto.price,
        currency: createPlanDto.currency ?? 'USD',
        interval: createPlanDto.interval,
        cvLimit: createPlanDto.cvLimit,
        jobDescriptionLimit: createPlanDto.jobDescriptionLimit,
        isActive: createPlanDto.isActive ?? true,
      },
    });
    if (createPlanDto.stripePriceId && plan.price.toNumber() > 0) {
      await this.prisma.planProviderPrice.create({
        data: {
          planId: plan.id,
          provider: PaymentProvider.STRIPE,
          interval: plan.interval,
          externalId: createPlanDto.stripePriceId,
        },
      });
    }
    return plan;
  }

  /**
   * Retrieves all active subscription plans for public plan selection.
   *
   * Plans are ordered by price in ascending order.
   *
   * @returns A list of active plans.
   */
  async findAll() {
    return this.prisma.plan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        price: 'asc',
      },
    });
  }

  /**
   * Retrieves all subscription plans for administrative management.
   *
   * Plans are ordered by creation date, with the newest returned first.
   *
   * @returns A list of all plans.
   */
  async findAllForAdmin() {
    return this.prisma.plan.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Retrieves a subscription plan by its ID.
   *
   * @param id - The ID of the plan to retrieve.
   * @returns The requested plan.
   *
   * @throws NotFoundException If the plan does not exist.
   */
  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  /**
   * Retrieves a plan and verifies that it is available for subscriptions.
   *
   * @param id - The ID of the plan to retrieve.
   * @returns The requested active plan.
   *
   * @throws NotFoundException If the plan does not exist.
   * @throws BadRequestException If the plan is inactive.
   */
  async findActivePlan(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: {
        id,
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (!plan.isActive) {
      throw new BadRequestException('Plan is not active');
    }

    return plan;
  }

  /**
   * Updates an existing subscription plan.
   *
   * @param id - The ID of the plan to update.
   * @param updatePlanDto - The plan fields to update.
   * @returns The updated plan.
   *
   * @throws NotFoundException If the plan does not exist.
   * @throws BadRequestException If the new name is already in use.
   */
  async update(id: string, updatePlanDto: UpdatePlanDto) {
    await this.findOne(id);

    if (updatePlanDto.name) {
      const existingPlan = await this.prisma.plan.findFirst({
        where: {
          name: updatePlanDto.name,
          NOT: {
            id,
          },
        },
      });

      if (existingPlan) {
        throw new BadRequestException('Plan with this name already exists');
      }
    }

    return this.prisma.plan.update({
      where: { id },
      data: updatePlanDto,
    });
  }

  /**
   * Deactivates a subscription plan so it cannot be selected by new users.
   *
   * @param id - The ID of the plan to deactivate.
   * @returns The deactivated plan.
   *
   * @throws NotFoundException If the plan does not exist.
   */
  async deactivate(id: string) {
    await this.findOne(id);

    return this.prisma.plan.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  /**
   * Activates a subscription plan.
   *
   * @param id - The ID of the plan to activate.
   * @returns The activated plan.
   *
   * @throws NotFoundException If the plan does not exist.
   */
  async activate(id: string) {
    await this.findOne(id);

    return this.prisma.plan.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
  }

  /**
   * Permanently deletes a subscription plan.
   *
   * @param id - The ID of the plan to delete.
   * @returns The deleted plan.
   *
   * @throws NotFoundException If the plan does not exist.
   */
  async delete(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return this.prisma.plan.delete({
      where: { id },
    });
  }
}
