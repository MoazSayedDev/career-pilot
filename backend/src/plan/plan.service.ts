import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto) {
    const existingPlan = await this.prisma.plan.findFirst({
      where: {
        name: createPlanDto.name,
      },
    });

    if (existingPlan) {
      throw new BadRequestException('Plan with this name already exists');
    }

    return this.prisma.plan.create({
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
  }

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

  async findAllForAdmin() {
    return this.prisma.plan.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

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

  async deactivate(id: string) {
    await this.findOne(id);

    return this.prisma.plan.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async activate(id: string) {
    await this.findOne(id);

    return this.prisma.plan.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
  }

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
