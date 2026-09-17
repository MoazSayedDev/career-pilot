import { plainToInstance } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsPort,
  IsOptional,
  validate,
} from 'class-validator';

/**
 * Environment variable validation class
 * Ensures all required environment variables are present and valid
 * Run at application startup
 */
class EnvironmentVariables {
  // Database
  @IsNotEmpty()
  @IsString()
  DATABASE_URL: string;

  // JWT Secrets (required)
  @IsNotEmpty()
  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsNotEmpty()
  @IsString()
  JWT_RESET_SECRET: string;

  // JWT Expiration (optional with defaults)
  @IsOptional()
  @IsString()
  JWT_ACCESS_EXPIRES_IN: string = '15m';

  @IsOptional()
  @IsString()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsOptional()
  @IsString()
  JWT_RESET_EXPIRES_IN: string = '15m';

  // SMTP Configuration (optional - email features disabled if not set)
  @IsOptional()
  @IsString()
  SMTP_HOST: string;

  @IsOptional()
  @IsPort()
  SMTP_PORT: string;

  @IsOptional()
  @IsString()
  SMTP_USER: string;

  @IsOptional()
  @IsString()
  SMTP_PASSWORD: string;

  @IsOptional()
  @IsString()
  SMTP_FROM: string = 'noreply@careerpilot.com';

  @IsOptional()
  @IsString()
  SMTP_SECURE: string = 'false';

  // Bcrypt
  @IsOptional()
  @IsNumber()
  BCRYPT_SALT_ROUNDS: number = 12;

  // Rate Limiting
  @IsOptional()
  @IsNumber()
  THROTTLE_TTL: number = 3600000; // 1 hour in ms

  @IsOptional()
  @IsNumber()
  THROTTLE_LIMIT: number = 100;

  // Application
  @IsOptional()
  @IsString()
  NODE_ENV: string = 'development';

  @IsOptional()
  @IsString()
  APP_URL: string;

  @IsOptional()
  @IsString()
  GEMINI_API_KEY: string;

  @IsOptional()
  @IsString()
  GEMINI_MODEL: string = 'gemini-2.5-flash';

  @IsNotEmpty()
  @IsString()
  GEMINI_ENCRYPTION_KEY: string;
}

/**
 * Validate environment variables
 * Called during application initialization
 * @param config - Environment config object
 * @throws Error if validation fails
 */
export async function validateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = await validate(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  return validatedConfig;
}
