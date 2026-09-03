import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// Configuration
import { authConfig, emailConfig, throttlerConfig } from './config/config';
import { validateEnvironment } from './config/validation';

// Global filters and interceptors
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// Core modules
import { PrismaModule } from './prisma/prisma.module';

// Feature modules
import { ProfileModule } from './profile/profile.module';
import { CacheModule } from './cache/cache.module';

import { ContactInfoModule } from './contact-info/contact-info.module';
import { SkillModule } from './skill/skill.module';
import { ExperienceModule } from './experience/experience.module';
import { ProjectModule } from './project/project.module';
import { EducationModule } from './education/education.module';
import { CertificateModule } from './certificate/certificate.module';
import { LanguageModule } from './language/language.module';
import { ResumeModule } from './resume/resume.module';
import { AiModule } from './ai/ai.module';
import { PdfModule } from './pdf/pdf.module';

// Authentication modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TokenModule } from './token/token.module';
import { OtpModule } from './otp/otp.module';
import { EmailModule } from './email/email.module';
import { AiService } from './ai/ai.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
      load: [authConfig, emailConfig, throttlerConfig],
    }),

    // Rate limiting
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: parseInt(process.env.THROTTLE_TTL || '3600000', 10),
          limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
        },
      ],
    }),

    // Core
    PrismaModule,

    //
    CacheModule,
    // Authentication
    AuthModule,
    UsersModule,
    TokenModule,
    OtpModule,
    EmailModule,

    // Feature modules
    ProfileModule,
    ContactInfoModule,
    SkillModule,
    ExperienceModule,
    ProjectModule,
    EducationModule,
    CertificateModule,
    LanguageModule,
    ResumeModule,
    AiModule,
    PdfModule,
  ],
  controllers: [],
  providers: [
    AiService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
