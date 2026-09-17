import { Module } from '@nestjs/common';

import { GeminiModule } from '../gemini/gemini.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

/**
 * UsersModule provides user services
 * Handles user creation, retrieval, and management
 */
@Module({
  imports: [PrismaModule, GeminiModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
