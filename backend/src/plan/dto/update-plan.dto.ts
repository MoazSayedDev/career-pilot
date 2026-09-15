import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PlanInterval } from '@prisma/client';

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(PlanInterval)
  interval?: PlanInterval;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cvLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  jobDescriptionLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
