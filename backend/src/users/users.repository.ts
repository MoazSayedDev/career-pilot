import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

/**
 * UsersRepository handles all user-related database operations
 * Encapsulates Prisma queries for user operations
 * Ensures no business logic leakage
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new user
   * @param data - User creation data
   * @returns Created user
   */
  async create(data: {
    username: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
        isVerified: false,
      },
    });
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   * Email is normalized (lowercased and trimmed) before querying
   * @param email - User email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = this.normalizeEmail(email);
    return this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
  }

  /**
   * Find user by username
   * @param username - Username
   * @returns User or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username: username.trim() },
    });
  }

  /**
   * Update user verification status
   * @param userId - User ID
   * @param isVerified - Verification status
   * @returns Updated user
   */
  async updateVerification(userId: string, isVerified: boolean): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isVerified },
    });
  }

  /**
   * Update user password
   * @param userId - User ID
   * @param passwordHash - New password hash
   * @returns Updated user
   */
  async updatePassword(userId: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  /**
   * Update last login timestamp
   * @param userId - User ID
   * @returns Updated user
   */
  async updateLastLogin(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Increment failed login attempts
   * @param userId - User ID
   * @returns Updated user
   */
  async incrementFailedLoginAttempts(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 } },
    });
  }

  /**
   * Reset failed login attempts to 0
   * @param userId - User ID
   * @returns Updated user
   */
  async resetFailedLoginAttempts(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0 },
    });
  }

  /**
   * Lock user account until specified time
   * @param userId - User ID
   * @param lockedUntil - Lock expiration timestamp
   * @returns Updated user
   */
  async lockAccount(userId: string, lockedUntil: Date): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lockedUntil },
    });
  }

  /**
   * Unlock user account
   * @param userId - User ID
   * @returns Updated user
   */
  async unlockAccount(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lockedUntil: null },
    });
  }

  /**
   * Check if user exists by email
   * @param email - Email address
   * @returns Whether user exists
   */
  async existsByEmail(email: string): Promise<boolean> {
    const normalizedEmail = this.normalizeEmail(email);
    const count = await this.prisma.user.count({
      where: { email: normalizedEmail },
    });
    return count > 0;
  }

  /**
   * Check if user exists by username
   * @param username - Username
   * @returns Whether user exists
   */
  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { username: username.trim() },
    });
    return count > 0;
  }

  /**
   * Normalize email for consistent storage and querying
   * @param email - Email to normalize
   * @returns Normalized email
   */
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
