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
import {
  CreateResumeDto,
  CreateResumeByJobDescriptionDto,
} from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumeService } from './resume.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtAccessPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('resume')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  create(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateResumeDto) {
    return this.resumeService.create(user.sub, dto);
  }

  @Post('by-job-description')
  createByJobDescription(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateResumeByJobDescriptionDto,
  ) {
    return this.resumeService.createByJobDescription(
      user.sub,
      dto.jobDescription,
    );
  }

  @Get()
  findAll(@CurrentUser() user: JwtAccessPayload) {
    return this.resumeService.findAll(user.sub);
  }

  @Get(':resumeId')
  findOne(
    @CurrentUser() user: JwtAccessPayload,
    @Param('resumeId', ParseUUIDPipe) resumeId: string,
  ) {
    return this.resumeService.findOne(user.sub, resumeId);
  }

  @Patch(':resumeId')
  update(
    @CurrentUser() user: JwtAccessPayload,
    @Param('resumeId', ParseUUIDPipe) resumeId: string,
    @Body() dto: UpdateResumeDto,
  ) {
    return this.resumeService.update(user.sub, resumeId, dto);
  }

  @Delete(':resumeId')
  remove(
    @CurrentUser() user: JwtAccessPayload,
    @Param('resumeId', ParseUUIDPipe) resumeId: string,
  ) {
    return this.resumeService.remove(user.sub, resumeId);
  }
}
