import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtAccessPayload } from './interfaces/jwt-payload.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationOtpDto } from './dto/resend-verification-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CurrentUserDto } from './dto/current-user.dto';
import { request, type Request, type Response } from 'express';

/**
 * AuthController handles all authentication endpoints
 * All endpoints return consistent response format
 * Controllers are thin - business logic is in AuthService
 *
 * Rate limiting is applied to prevent abuse
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Register a new user
   *
   * Rate limit: 5 per hour per IP
   * Response: 201 Created
   */
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/verify-email
   * Verify email with OTP
   *
   * Rate limit: 10 per hour per user
   * Response: 200 OK
   */
  @Post('verify-email')
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    return this.authService.verifyEmail(dto);
  }

  /**
   * POST /auth/resend-verification-otp
   * Resend verification OTP email
   *
   * Rate limit: 5 per hour per user
   * Response: 200 OK
   */
  @Post('resend-verification-otp')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  async resendVerificationOtp(@Body() dto: ResendVerificationOtpDto): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    return this.authService.resendVerificationOtp(dto);
  }

  /**
   * POST /auth/login
   * User login
   *
   * Rate limit: 10 per hour per IP
   * Response: 200 OK
   */
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      accessToken: string;
      user: CurrentUserDto;
    };
  }> {
    const result = await this.authService.login(dto);

    // "Remember me" (default true) keeps a 7-day persistent cookie;
    // unchecked logins get a browser-session cookie instead.
    res.cookie('refreshToken', result.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      ...(dto.rememberMe === false
        ? {}
        : { maxAge: 7 * 24 * 60 * 60 * 1000 }), // 7 days
    });

    return {
      success: true,
      message: result.message,
      data: {
        accessToken: result.data.accessToken,
        user: result.data.user,
      },
    };
  }

  /**
   * POST /auth/refresh
   * Refresh access token with rotation
   *
   * Rate limit: 30 per hour per user
   * Response: 200 OK
   */
  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      accessToken: string;
    };
  }> {
    const refreshToken = req.cookies.refreshToken;

    const result = await this.authService.refreshToken({
      refreshToken,
    });

    res.cookie('refreshToken', result.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      message: result.message,
      data: {
        accessToken: result.data.accessToken,
      },
    };
  }

  /**
   * POST /auth/logout
   * Logout from current device (invalidate one refresh token)
   *
   * Authentication: Required (JWT)
   * Response: 200 OK
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: JwtAccessPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    const refreshToken = req.cookies.refreshToken;

    const result = await this.authService.logout(user.sub, refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return result;
  }

  /**
   * POST /auth/logout-all
   * Logout from all devices (invalidate all refresh tokens)
   *
   * Authentication: Required (JWT)
   * Response: 200 OK
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser() user: JwtAccessPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    const result = await this.authService.logoutAll(user.sub);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return result;
  }

  /**
   * POST /auth/forgot-password
   * Initiate password reset
   *
   * Rate limit: 5 per hour per email
   * Response: 200 OK
   */
  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    return this.authService.forgotPassword(dto);
  }

  /**
   * POST /auth/verify-reset-otp
   * Verify password reset OTP
   *
   * Rate limit: 10 per hour per email
   * Response: 200 OK
   */
  @Post('verify-reset-otp')
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  async verifyResetOtp(@Body() dto: VerifyResetOtpDto): Promise<{
    success: boolean;
    message: string;
    data: {
      resetToken: string;
    };
  }> {
    return this.authService.verifyResetOtp(dto);
  }

  /**
   * POST /auth/reset-password
   * Reset password with reset token
   *
   * Rate limit: 5 per hour per email
   * Response: 200 OK
   */
  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    return this.authService.resetPassword(dto);
  }

  /**
   * GET /auth/me
   * Get current authenticated user
   *
   * Authentication: Required (JWT)
   * Response: 200 OK
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@CurrentUser() user: JwtAccessPayload): Promise<{
    success: boolean;
    message: string;
    data: CurrentUserDto;
  }> {
    const userData = await this.authService.getCurrentUser(user.sub);

    return {
      success: true,
      message: 'User data retrieved',
      data: userData,
    };
  }
}
