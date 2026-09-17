import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OptimizeResumeDto } from './dto/optimize-resume.dto';
import { GeminiApiKeyDto } from './dto/gemini-api-key.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtAccessPayload } from 'src/auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('/optimize-resume')
  async optimizeResume(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: OptimizeResumeDto,
  ) {
    return this.aiService.optimizeResume(user.sub, dto.jobDescription);
  }

  @Post('/gemini-key')
  @HttpCode(HttpStatus.OK)
  async setGeminiApiKey(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: GeminiApiKeyDto,
  ) {
    return this.aiService.setGeminiApiKey(user.sub, dto.apiKey);
  }

  @Put('/gemini-key')
  @HttpCode(HttpStatus.OK)
  async updateGeminiApiKey(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: GeminiApiKeyDto,
  ) {
    return this.aiService.setGeminiApiKey(user.sub, dto.apiKey);
  }

  @Delete('/gemini-key')
  @HttpCode(HttpStatus.OK)
  async clearGeminiApiKey(@CurrentUser() user: JwtAccessPayload) {
    return this.aiService.clearGeminiApiKey(user.sub);
  }

  @Get('/gemini-key/status')
  @HttpCode(HttpStatus.OK)
  async getGeminiApiKeyStatus(@CurrentUser() user: JwtAccessPayload) {
    return this.aiService.getGeminiApiKeyStatus(user.sub);
  }
}
