import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PlanInterval } from '@prisma/client';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsEnum(PlanInterval)
  interval: PlanInterval;

  @IsNumber()
  @Min(0)
  cvLimit: number;

  @IsNumber()
  @Min(0)
  jobDescriptionLimit: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
