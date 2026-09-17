import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { GeminiApiKeyService } from './gemini-api-key.service';

@Module({
  imports: [PrismaModule],
  providers: [GeminiApiKeyService],
  exports: [GeminiApiKeyService],
})
export class GeminiModule {}
