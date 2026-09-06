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
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { LanguageService } from './language.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtAccessPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('language')
@UseGuards(JwtAuthGuard)
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  create(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateLanguageDto,
  ) {
    return this.languageService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtAccessPayload) {
    return this.languageService.findAll(user.sub);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) languageId: string,
  ) {
    return this.languageService.findOne(user.sub, languageId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) languageId: string,
    @Body() dto: UpdateLanguageDto,
  ) {
    return this.languageService.update(user.sub, languageId, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) languageId: string,
  ) {
    return this.languageService.remove(user.sub, languageId);
  }
}
