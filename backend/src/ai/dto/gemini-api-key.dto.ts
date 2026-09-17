import { IsNotEmpty, IsString } from 'class-validator';

export class GeminiApiKeyDto {
  @IsString()
  @IsNotEmpty()
  apiKey!: string;
}
