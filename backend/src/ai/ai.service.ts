import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

import { GeminiApiKeyService } from '../gemini/gemini-api-key.service';
import { ProfileService } from '../profile/profile.service';
import { RESUME_OPTIMIZER_PROMPT } from './prompt';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly profileServices: ProfileService,
    private readonly geminiApiKeyService: GeminiApiKeyService,
  ) {
    this.model =
      this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash';
  }

  private async getClientForUser(userId: string): Promise<GoogleGenAI> {
    const apiKey =
      await this.geminiApiKeyService.getEffectiveGeminiApiKey(userId);

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'AI service is not configured. Please try again later.',
      );
    }

    return new GoogleGenAI({ apiKey });
  }

  async optimizeResume(userId: string, jobDescription: string) {
    const myProfile = await this.profileServices.findMe(userId);
    if (!myProfile) {
      throw new NotFoundException('Profile not found');
    }

    const prompt = RESUME_OPTIMIZER_PROMPT.replace(
      '{{JOB_DESCRIPTION}}',
      jobDescription,
    ).replace('{{PROFILE}}', JSON.stringify(myProfile, null, 2));

    try {
      const ai = await this.getClientForUser(userId);
      const response = await ai.models.generateContent({
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
      if (
        error instanceof NotFoundException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }
      this.logger.error('Gemini request failed', error as Error);
      throw new ServiceUnavailableException(
        'AI service is temporarily unavailable. Please try again.',
      );
    }
  }

  async setGeminiApiKey(
    userId: string,
    apiKey: string,
  ): Promise<{ configured: boolean }> {
    const encryptedApiKey = this.geminiApiKeyService.encrypt(apiKey);
    await this.geminiApiKeyService.setUserGeminiApiKey(userId, encryptedApiKey);

    return { configured: true };
  }

  async clearGeminiApiKey(
    userId: string,
  ): Promise<{ configured: boolean }> {
    await this.geminiApiKeyService.clearUserGeminiApiKey(userId);
    return { configured: false };
  }

  async getGeminiApiKeyStatus(
    userId: string,
  ): Promise<{ configured: boolean }> {
    return {
      configured:
        await this.geminiApiKeyService.hasConfiguredGeminiKey(userId),
    };
  }
}
