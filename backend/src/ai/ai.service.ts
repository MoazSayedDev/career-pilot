import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { RESUME_OPTIMIZER_PROMPT } from './prompt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileService } from 'src/profile/profile.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ai: GoogleGenAI | null;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly profileServices: ProfileService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.model = this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash';
    // The client is created lazily-safe: without a key every request fails
    // fast with a clean 503 instead of an unhandled 500.
    this.ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }

  async optimizeResume(userId: string, jobDescription: string) {
    if (!this.ai) {
      throw new ServiceUnavailableException(
        'AI service is not configured. Please try again later.',
      );
    }

    const myProfile = await this.profileServices.findMe(userId);
    if (!myProfile) {
      throw new NotFoundException('Profile not found');
    }

    const prompt = RESUME_OPTIMIZER_PROMPT.replace(
      '{{JOB_DESCRIPTION}}',
      jobDescription,
    ).replace('{{PROFILE}}', JSON.stringify(myProfile, null, 2));

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      const text = response.text;

      if (!text) {
        throw new ServiceUnavailableException(
          'AI service returned an empty response. Please try again.',
        );
      }

      const cleaned = text
        .replace(/^```json/, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();

      return JSON.parse(cleaned);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ServiceUnavailableException) {
        throw error;
      }
      this.logger.error('Gemini request failed', error as Error);
      throw new ServiceUnavailableException(
        'AI service is temporarily unavailable. Please try again.',
      );
    }
  }
}
