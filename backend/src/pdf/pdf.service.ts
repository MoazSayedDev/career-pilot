import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResumeService } from 'src/resume/resume.service';
import { PdfGenerator } from './generators/pdf-generator.service';
import { ProfileService } from 'src/profile/profile.service';
import { mapResumeToCvData } from './resume-mapper';

@Injectable()
export class PdfService {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly profileService: ProfileService,
  ) {}

  /**
   * Generates a PDF for an authenticated user's resume.
   *
   * @param userId - The ID of the authenticated user.
   * @param resumeId - The ID of the resume to render.
   * @returns The generated PDF as a buffer.
   * @throws NotFoundException If the user's profile or resume does not exist.
   */
  async generatePdf(userId: string, resumeId: string): Promise<Buffer> {
    const resume = await this.resumeService.findOne(userId, resumeId);
    const profile = await this.profileService.findMe(userId);

    const cvData = mapResumeToCvData(resume, profile);

    const pdfBuffer = await PdfGenerator.generatePdf(cvData, {
      templateId: resume.template,
    });

    return pdfBuffer;
  }
}
