import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OptimizeResumeDto } from './dto/optimize-resume.dto';
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
}
