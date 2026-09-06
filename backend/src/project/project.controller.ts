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
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtAccessPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('project')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateProjectDto) {
    return this.projectService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtAccessPayload) {
    return this.projectService.findAll(user.sub);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) projectId: string,
  ) {
    return this.projectService.findOne(user.sub, projectId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.update(user.sub, projectId, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) projectId: string,
  ) {
    return this.projectService.remove(user.sub, projectId);
  }
}
