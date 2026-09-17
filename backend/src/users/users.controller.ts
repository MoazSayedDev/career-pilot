import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';
import { UsersService } from './users.service';

class SetGeminiApiKeyDto {
  @IsString()
  @IsNotEmpty()
  apiKey: string;
}

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('me/gemini-key')
  @HttpCode(HttpStatus.OK)
  async setGeminiApiKey(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: SetGeminiApiKeyDto,
  ) {
    return this.usersService.setGeminiApiKey(user.sub, dto.apiKey);
  }

  @Delete('me/gemini-key')
  @HttpCode(HttpStatus.OK)
  async clearGeminiApiKey(@CurrentUser() user: JwtAccessPayload) {
    return this.usersService.clearGeminiApiKey(user.sub);
  }

  @Get('me/gemini-key/status')
  @HttpCode(HttpStatus.OK)
  async getGeminiApiKeyStatus(@CurrentUser() user: JwtAccessPayload) {
    return this.usersService.getGeminiApiKeyStatus(user.sub);
  }
}
