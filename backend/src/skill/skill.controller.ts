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
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillService } from './skill.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtAccessPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('skill')
@UseGuards(JwtAuthGuard)
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post()
  create(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateSkillDto) {
    return this.skillService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtAccessPayload) {
    return this.skillService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtAccessPayload, @Param('id', ParseUUIDPipe) skillId: string) {
    return this.skillService.findOne(user.sub, skillId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) skillId: string,
    @Body() dto: UpdateSkillDto,
  ) {
    return this.skillService.update(user.sub, skillId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtAccessPayload, @Param('id', ParseUUIDPipe) skillId: string) {
    return this.skillService.remove(user.sub, skillId);
  }
}
