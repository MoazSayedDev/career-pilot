import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenModule } from '../token/token.module';
import { OtpModule } from '../otp/otp.module';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfileModule } from 'src/profile/profile.module';
import { GoogleStrategy } from './strategies/google.strategy';

/**
 * AuthModule handles all authentication-related operations
 * Orchestrates Token, OTP, Email, and Users modules
 * Provides JwtAuthGuard for route protection
 */
@Module({
  imports: [
    JwtModule.register({}),
    PassportModule,
    TokenModule,
    OtpModule,
    EmailModule,
    UsersModule,
    PrismaModule,
    ProfileModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy, GoogleStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
