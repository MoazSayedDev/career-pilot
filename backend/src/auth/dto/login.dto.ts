import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO for user login
 * Validates email and password
 */
export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  /**
   * When false the refresh cookie becomes a browser-session cookie
   * (no maxAge) so it disappears when the browser closes.
   */
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
