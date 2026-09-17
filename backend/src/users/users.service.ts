import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { PasswordUtil } from '../common/utils/password.util';
import { UsersRepository } from './users.repository';

/**
 * UsersService handles user business logic
 * Delegates database operations to UsersRepository
 * Responsible for:
 * - User creation and retrieval
 * - User data sanitization
 * - Password operations
 * - Account locking/unlocking
 * - Login attempt tracking
 */
@Injectable()
export class UsersService {
  private readonly accountLockDurationMinutes = 15;
  private readonly maxFailedAttempts = 5;

  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  /**
   * Create a new user
   * @param username - Username
   * @param email - Email (will be normalized)
   * @param password - Plaintext password
   * @returns Created user (sanitized)
   */
  async createUser(
    username: string,
    email: string,
    password: string,
  ): Promise<CurrentUserDto> {
    const passwordHash = await PasswordUtil.hash(password);

    const user = await this.usersRepository.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
    });

    return this.sanitizeUser(user);
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User or throws NotFoundException
   */
  async getUserById(id: string): Promise<CurrentUserDto> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Find user by email (internal use, returns full user object)
   * @param email - User email
   * @returns Full user object or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  /**
   * Find user by ID (internal use, returns full user object)
   * @param id - User ID
   * @returns Full user object or null
   */
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  /**
   * Find user by username (internal use, returns full user object)
   * @param username - Username
   * @returns Full user object or null
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  /**
   * Verify user password
   * @param user - User object
   * @param password - Plaintext password to verify
   * @returns Whether password is correct
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return PasswordUtil.compare(password, user.passwordHash);
  }

  /**
   * Check if user account is locked
   * @param user - User object
   * @returns Whether account is currently locked
   */
  isAccountLocked(user: User): boolean {
    if (!user.lockedUntil) {
      return false;
    }

    return new Date() < user.lockedUntil;
  }

  /**
   * Handle failed login attempt
   * Locks account if max attempts exceeded
   * @param userId - User ID
   * @returns Updated user object
   */
  async handleFailedLogin(userId: string): Promise<User> {
    const user =
      await this.usersRepository.incrementFailedLoginAttempts(userId);

    if (user.failedLoginAttempts >= this.maxFailedAttempts) {
      const lockUntil = new Date();
      lockUntil.setMinutes(
        lockUntil.getMinutes() + this.accountLockDurationMinutes,
      );

      return this.usersRepository.lockAccount(userId, lockUntil);
    }

    return user;
  }

  /**
   * Handle successful login
   * Resets failed attempts and updates last login time
   * @param userId - User ID
   * @returns Updated user object
   */
  async handleSuccessfulLogin(userId: string): Promise<User> {
    const user = await this.usersRepository.resetFailedLoginAttempts(userId);
    return this.usersRepository.updateLastLogin(userId);
  }

  /**
   * Mark user as verified
   * @param userId - User ID
   * @returns Updated user (sanitized)
   */
  async markAsVerified(userId: string): Promise<CurrentUserDto> {
    const user = await this.usersRepository.updateVerification(userId, true);
    return this.sanitizeUser(user);
  }

  /**
   * Update user password
   * @param userId - User ID
   * @param newPassword - New plaintext password
   * @returns Updated user (sanitized)
   */
  async updatePassword(
    userId: string,
    newPassword: string,
  ): Promise<CurrentUserDto> {
    const passwordHash = await PasswordUtil.hash(newPassword);
    const user = await this.usersRepository.updatePassword(
      userId,
      passwordHash,
    );
    return this.sanitizeUser(user);
  }

  /**
   * Sanitize user object for API responses
   * Removes sensitive fields: passwordHash, etc.
   * @param user - User object
   * @returns Sanitized user DTO
   */
  sanitizeUser(user: User): CurrentUserDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Check if email exists
   * @param email - Email to check
   * @returns Whether email exists
   */
  async emailExists(email: string): Promise<boolean> {
    return this.usersRepository.existsByEmail(email);
  }

  /**
   * Check if username exists
   * @param username - Username to check
   * @returns Whether username exists
   */
  async usernameExists(username: string): Promise<boolean> {
    return this.usersRepository.existsByUsername(username);
  }

}
