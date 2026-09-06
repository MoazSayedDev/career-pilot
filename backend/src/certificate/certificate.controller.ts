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
import { CertificateService } from './certificate.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtAccessPayload } from 'src/auth//interfaces/jwt-payload.interface';

@Controller('certificate')
@UseGuards(JwtAuthGuard)
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  create(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateCertificateDto,
  ) {
    return this.certificateService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtAccessPayload) {
    return this.certificateService.findAll(user.sub);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) certificateId: string,
  ) {
    return this.certificateService.findOne(user.sub, certificateId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) certificateId: string,
    @Body() dto: UpdateCertificateDto,
  ) {
    return this.certificateService.update(user.sub, certificateId, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) certificateId: string,
  ) {
    return this.certificateService.remove(user.sub, certificateId);
  }
}
