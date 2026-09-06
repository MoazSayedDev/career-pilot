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
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { ExperienceService } from './experience.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { JwtAccessPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('experience')
@UseGuards(JwtAuthGuard)
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Post()
  create(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateExperienceDto,
  ) {
    return this.experienceService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtAccessPayload) {
    return this.experienceService.findAll(user.sub);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) experienceId: string,
  ) {
    return this.experienceService.findOne(user.sub, experienceId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) experienceId: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.experienceService.update(user.sub, experienceId, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) experienceId: string,
  ) {
    return this.experienceService.remove(user.sub, experienceId);
  }
}
