import {
  ParseUUIDPipe,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { EducationService } from './education.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtAccessPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('education')
@UseGuards(JwtAuthGuard)
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Post()
  create(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateEducationDto,
  ) {
    return this.educationService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtAccessPayload) {
    return this.educationService.findAll(user.sub);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) educationId: string,
  ) {
    return this.educationService.findOne(user.sub, educationId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) educationId: string,
    @Body() dto: UpdateEducationDto,
  ) {
    return this.educationService.update(user.sub, educationId, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) educationId: string,
  ) {
    return this.educationService.remove(user.sub, educationId);
  }
}
