import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { OtpPurpose } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../token/token.service';
import { OtpService } from '../otp/otp.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { ProfileService } from 'src/profile/profile.service';
import { SubscriptionService } from 'src/subscription/subscription.service';

import { AuthRepository } from './auth.repository';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationOtpDto } from './dto/resend-verification-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CurrentUserDto } from './dto/current-user.dto';

import { PasswordUtil } from '../common/utils/password.util';
import { OtpUtil } from '../common/utils/otp.util';

/**
 * AuthService handles all authentication operations
 * Orchestrates business logic across multiple services and repositories
 *
 * Responsibilities:
 * - User registration with OTP verification
 * - Email verification
 * - User login with account locking
 * - Token refresh with rotation
 * - Password reset workflow
 * - Account verification
 * - Logout operations
 *
 * Security principles:
 * - No plaintext passwords logged
 * - No plaintext OTPs logged
 * - No plaintext refresh tokens logged
 * - Account locking after failed attempts
 * - Email enumeration prevention
 * - OTP attempt limiting
 * - Refresh token rotation
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly authRepository: AuthRepository,
    private readonly profileServices: ProfileService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * Register a new user
   * 1. Validate input
   * 2. Check email/username uniqueness
   * 3. Create user and OTP in transaction
   * 4. Send verification email (outside transaction)
   *
   * @param dto - Registration data
   * @throws ConflictException if email or username already exists
   * @throws BadRequestException for validation errors
   */
  async register(dto: RegisterDto): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    // Normalize inputs
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim();

    // Validate password strength
    const passwordError = PasswordUtil.getPasswordValidationError(dto.password);
    if (passwordError) {
      throw new BadRequestException(passwordError);
    }

    // Check password match
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check email uniqueness
    if (await this.usersService.emailExists(email)) {
      throw new ConflictException('Email already registered');
    }

    // Check username uniqueness
    if (await this.usersService.usernameExists(username)) {
      throw new ConflictException('Username already taken');
    }

    // Create user and OTP in transaction
    let user;
    let otp: string;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Create user
        const passwordHash = await PasswordUtil.hash(dto.password);
        const createdUser = await tx.user.create({
          data: {
            username,
            email,
            passwordHash,
            isVerified: false,
          },
        });

        await this.subscriptionService.createFreeSubscriptionForUser(
          createdUser.id,
          tx,
        );

        // Create OTP
        const otpCode = OtpUtil.generateOtp();
        const otpHash = await OtpUtil.hash(otpCode);
        const expiresAt = OtpUtil.calculateExpiration();

        await tx.otp.create({
          data: {
            userId: createdUser.id,
            codeHash: otpHash,
            purpose: OtpPurpose.EMAIL_VERIFICATION,
            expiresAt,
            attempts: 0,
          },
        });

        return { user: createdUser, otp: otpCode };
      });

      user = result.user;
      otp = result.otp;
    } catch (error) {
      this.logger.error('Error during user registration', error);
      throw new BadRequestException('Registration failed. Please try again.');
    }

    // Send verification email (OUTSIDE transaction)
    this.emailService
      .sendVerificationEmail(email, username, otp)
      .catch((error) => {
        this.logger.error(
          `Failed to send verification email for user ${user.id}`,
          error,
        );
      });

    return {
      success: true,
      message:
        'Registration successful. Please check your email to verify your account.',
      data: null,
    };
  }

  /**
   * Verify user email with OTP
   * 1. Find user
   * 2. Verify OTP
   * 3. Mark user as verified
   * 4. Invalidate OTP
   *
   * @param dto - Email and OTP
   * @throws BadRequestException for invalid OTP
   * @throws UnauthorizedException if OTP expired/invalid
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    const email = dto.email.trim().toLowerCase();

    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or OTP');
    }

    // Check if already verified
    if (user.isVerified) {
      return {
        success: true,
        message: 'Email already verified',
        data: null,
      };
    }

    // Verify OTP
    const isValidOtp = await this.otpService.verifyOtp(
      user.id,
      dto.otp,
      OtpPurpose.EMAIL_VERIFICATION,
    );

    if (!isValidOtp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Mark as verified and invalidate OTP in transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });

      await tx.otp.deleteMany({
        where: {
          userId: user.id,
          purpose: OtpPurpose.EMAIL_VERIFICATION,
        },
      });
    });

    return {
      success: true,
      message: 'Email verified successfully. You can now log in.',
      data: null,
    };
  }

  /**
   * Resend verification OTP
   * Respects 60-second cooldown between requests
   * Does not reveal whether email exists
   *
   * @param dto - Email address
   * @throws BadRequestException on rate limit/cooldown
   */
  async resendVerificationOtp(dto: ResendVerificationOtpDto): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    const email = dto.email.trim().toLowerCase();

    // Find user (silently fail if not found)
    const user = await this.usersService.findByEmail(email);

    if (user && !user.isVerified) {
      // Check cooldown
      const canRequest = await this.otpService.canRequestNewOtp(
        user.id,
        OtpPurpose.EMAIL_VERIFICATION,
      );

      if (!canRequest) {
        throw new BadRequestException(
          'Please wait before requesting a new code. Try again in a few moments.',
        );
      }

      // Create new OTP
      const otp = await this.otpService.createOtp(
        user.id,
        OtpPurpose.EMAIL_VERIFICATION,
      );

      // Send email
      await this.emailService.sendVerificationEmail(email, user.username, otp);
    }

    // Always return generic response (don't reveal if email exists)
    return {
      success: true,
      message:
        'If an account exists with this email, a verification code has been sent.',
      data: null,
    };
  }

  /**
   * User login
   * 1. Find user
   * 2. Check account lock
   * 3. Verify password
   * 4. Check email verification
   * 5. Generate tokens
   * 6. Store refresh token hash
   * 7. Update last login
   *
   * @param dto - Email and password
   * @throws UnauthorizedException for invalid credentials
   * @throws ForbiddenException for unverified accounts
   */
  async login(dto: LoginDto): Promise<{
    success: boolean;
    message: string;
    data: {
      accessToken: string;
      refreshToken: string;
      user: CurrentUserDto;
    };
  }> {
    const email = dto.email.trim().toLowerCase();

    // Find user
    const user = await this.usersService.findByEmail(email);

    // Generic error response (don't reveal if email exists)
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check account lock
    if (this.usersService.isAccountLocked(user)) {
      const remainingMinutes = this.calculateLockRemainingMinutes(
        user.lockedUntil!,
      );
      throw new UnauthorizedException(
        `Account locked. Try again in ${remainingMinutes} minutes.`,
      );
    }

    // Verify password
    const isPasswordValid = await this.usersService.verifyPassword(
      user,
      dto.password,
    );

    if (!isPasswordValid) {
      // Handle failed login
      await this.usersService.handleFailedLogin(user.id);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check email verification
    if (!user.isVerified) {
      throw new ForbiddenException(
        'Email not verified. Please verify your email first.',
      );
    }

    // Handle successful login
    await this.usersService.handleSuccessfulLogin(user.id);

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken(
      user.id,
      user.email,
    );
    const refreshToken = this.tokenService.generateRefreshToken(user.id);
    const refreshTokenHash =
      await this.tokenService.hashRefreshToken(refreshToken);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.authRepository.createRefreshToken(
      user.id,
      refreshTokenHash,
      expiresAt,
    );

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: this.usersService.sanitizeUser(user),
      },
    };
  }

  /**
   * Refresh access token with rotation
   * 1. Verify refresh token
   * 2. Find stored token hash
   * 3. Compare and validate
   * 4. Generate new tokens
   * 5. Invalidate old token (rotation)
   * 6. Store new token hash
   *
   * @param dto - Refresh token
   * @throws UnauthorizedException for invalid/expired token
   */
  async refreshToken(dto: RefreshTokenDto): Promise<{
    success: boolean;
    message: string;
    data: {
      accessToken: string;
      refreshToken: string;
    };
  }> {
    let payload;

    // Verify JWT
    try {
      payload = this.tokenService.verifyRefreshToken(dto.refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId = payload.sub;

    // Find user
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Find stored token hash
    const storedTokens =
      await this.authRepository.findUserRefreshTokens(userId);
    let tokenRecordFound = false;

    for (const record of storedTokens) {
      const isValidToken = await this.tokenService.compareRefreshTokens(
        dto.refreshToken,
        record.tokenHash,
      );

      if (isValidToken) {
        // Check expiration
        if (record.expiresAt < new Date()) {
          throw new UnauthorizedException('Refresh token expired');
        }

        tokenRecordFound = true;

        // Generate new tokens (rotate)
        const newAccessToken = this.tokenService.generateAccessToken(
          user.id,
          user.email,
        );
        const newRefreshToken = this.tokenService.generateRefreshToken(user.id);
        const newRefreshTokenHash =
          await this.tokenService.hashRefreshToken(newRefreshToken);

        // Invalidate old token and store new one (rotation)
        await this.prisma.$transaction(async (tx) => {
          // Delete old token
          await tx.refreshToken.delete({
            where: { id: record.id },
          });

          // Create new token
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

          await tx.refreshToken.create({
            data: {
              userId,
              tokenHash: newRefreshTokenHash,
              expiresAt,
            },
          });
        });

        return {
          success: true,
          message: 'Token refreshed successfully',
          data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
        };
      }
    }

    if (!tokenRecordFound) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    throw new UnauthorizedException('Token refresh failed');
  }

  /**
   * Logout (single device)
   * Invalidates single refresh token
   *
   * @param userId - User ID
   * @param refreshToken - Refresh token to invalidate
   */
  async logout(
    userId: string,
    refreshToken: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      // Don't reveal whether user exists
      return {
        success: true,
        message: 'Logout successful',
        data: null,
      };
    }

    // Find and delete the token
    const tokens = await this.authRepository.findUserRefreshTokens(user.id);

    for (const record of tokens) {
      const isValidToken = await this.tokenService.compareRefreshTokens(
        refreshToken,
        record.tokenHash,
      );

      if (isValidToken) {
        await this.authRepository.deleteRefreshToken(record.id);
        break;
      }
    }

    return {
      success: true,
      message: 'Logout successful',
      data: null,
    };
  }

  /**
   * Logout from all devices
   * Invalidates all refresh tokens for the user
   *
   * @param userId - User ID
   */
  async logoutAll(userId: string): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    await this.authRepository.deleteUserRefreshTokens(userId);

    return {
      success: true,
      message: 'Logged out from all devices',
      data: null,
    };
  }

  /**
   * Initiate password reset
   * Generates PASSWORD_RESET OTP and sends email
   * Does not reveal whether account exists
   *
   * @param dto - Email address
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    const email = dto.email.trim().toLowerCase();

    // Find user (silently fail if not found)
    const user = await this.usersService.findByEmail(email);

    if (user) {
      // Create PASSWORD_RESET OTP
      const otp = await this.otpService.createOtp(
        user.id,
        OtpPurpose.PASSWORD_RESET,
      );

      // Send email
      await this.emailService.sendResetPasswordEmail(email, user.username, otp);
    }

    // Always return generic response
    return {
      success: true,
      message:
        'If an account exists with this email, a password reset code has been sent.',
      data: null,
    };
  }

  /**
   * Verify password reset OTP
   * Issues a short-lived reset token for use in password reset endpoint
   *
   * @param dto - Email and OTP
   * @throws UnauthorizedException for invalid OTP
   */
  async verifyResetOtp(dto: VerifyResetOtpDto): Promise<{
    success: boolean;
    message: string;
    data: {
      resetToken: string;
    };
  }> {
    const email = dto.email.trim().toLowerCase();

    // Find user
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or reset code');
    }

    // Verify OTP
    const isValidOtp = await this.otpService.verifyOtp(
      user.id,
      dto.otp,
      OtpPurpose.PASSWORD_RESET,
    );

    if (!isValidOtp) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    // Invalidate OTP
    await this.otpService.invalidateOtp(user.id, OtpPurpose.PASSWORD_RESET);

    // Generate short-lived reset token
    const resetToken = this.tokenService.generateResetToken(
      user.id,
      user.email,
    );

    return {
      success: true,
      message: 'Reset code verified',
      data: { resetToken },
    };
  }

  /**
   * Reset password
   * 1. Verify reset token
   * 2. Validate new password
   * 3. Update password
   * 4. Invalidate all refresh tokens (logout all devices)
   * 5. Clean up reset OTP
   *
   * @param dto - Email, reset token, and new password
   * @throws UnauthorizedException for invalid token
   * @throws BadRequestException for validation errors
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    const email = dto.email.trim().toLowerCase();

    // Verify reset token
    let payload;
    try {
      payload = this.tokenService.verifyResetToken(dto.resetToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Find user
    const user = await this.usersService.findByEmail(email);

    if (!user || user.id !== payload.sub) {
      throw new UnauthorizedException('Invalid reset token');
    }

    // Validate password strength
    const passwordError = PasswordUtil.getPasswordValidationError(dto.password);
    if (passwordError) {
      throw new BadRequestException(passwordError);
    }

    // Check password match
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Update password, invalidate tokens, clean OTP in transaction
    try {
      await this.prisma.$transaction(async (tx) => {
        // Update password
        const passwordHash = await PasswordUtil.hash(dto.password);
        await tx.user.update({
          where: { id: user.id },
          data: { passwordHash },
        });

        // Invalidate all refresh tokens (logout all devices)
        await tx.refreshToken.deleteMany({
          where: { userId: user.id },
        });

        // Clean up PASSWORD_RESET OTP
        await tx.otp.deleteMany({
          where: {
            userId: user.id,
            purpose: OtpPurpose.PASSWORD_RESET,
          },
        });
      });
    } catch (error) {
      this.logger.error('Error during password reset', error);
      throw new BadRequestException('Password reset failed. Please try again.');
    }

    return {
      success: true,
      message:
        'Password reset successful. Please log in with your new password.',
      data: null,
    };
  }

  /**
   * Get current user information
   * @param userId - User ID
   * @returns Sanitized user data
   * @throws NotFoundException if user not found
   */
  async getCurrentUser(userId: string): Promise<CurrentUserDto> {
    return this.usersService.getUserById(userId);
  }

  /**
   * Helper to calculate remaining lock time
   */
  private calculateLockRemainingMinutes(lockedUntil: Date): number {
    const now = new Date();
    const diffMs = lockedUntil.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60));
  }
}
