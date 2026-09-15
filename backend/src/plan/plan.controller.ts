import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  // Public active plans
  @Get()
  findAll() {
    return this.planService.findAll();
  }

  // Admin
  @Get('admin/all')
  findAllForAdmin() {
    return this.planService.findAllForAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planService.findOne(id);
  }

  // Admin
  @Post()
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planService.create(createPlanDto);
  }

  // Admin
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.planService.update(id, updatePlanDto);
  }

  // Admin
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.planService.deactivate(id);
  }

  // Admin
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.planService.activate(id);
  }

  @Delete(':id/delete')
  delete(@Param('id') id: string) {
    return this.planService.delete(id);
  }
}
