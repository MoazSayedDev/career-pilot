import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResumeTemplate } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { AiService } from 'src/ai/ai.service';

@Injectable()
export class ResumeService {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Creates a new resume for the authenticated user's profile.
   *
   * The method:
   * 1. Verifies that the user has a profile.
   * 2. Normalizes optional relation IDs to empty arrays.
   * 3. Validates that all selected skills, experiences, projects,
   *    certificates, educations, and languages belong to the user's profile.
   * 4. Creates the resume and its related records inside a single transaction.
   * 5. Uses the profile bio as a fallback when no generated summary is provided.
   *
   * If any validation or database operation fails, the entire transaction
   * is rolled back and no partial resume data is persisted.
   *
   * @param userId - The ID of the authenticated user.
   * @param dto - The data required to create the resume and its relations.
   *
   * @returns An object containing a success message and the created resume ID.
   *
   * @throws {NotFoundException} When the user's profile does not exist.
   * @throws {BadRequestException} When one or more selected related records
   * do not belong to the user's profile.
   */
  async create(userId: string, dto: CreateResumeDto) {
    // Check if profile exists
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        id: true,
        bio: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Normalize optional relation IDs
    const skillIds = dto.skillIds ?? [];
    const experienceIds = dto.experienceIds ?? [];
    const projectIds = dto.projectIds ?? [];
    const certificateIds = dto.certificateIds ?? [];
    const educationIds = dto.educationIds ?? [];
    const languageIds = dto.languageIds ?? [];

    return this.prisma.$transaction(async (tx) => {
      // Validate Skills
      if (skillIds.length) {
        const skills = await tx.skill.findMany({
          where: {
            id: { in: skillIds },
            profileId: profile.id,
          },
          select: {
            id: true,
          },
        });

        if (skills.length !== skillIds.length) {
          throw new BadRequestException('One or more skills are invalid.');
        }
      }

      // Validate Experiences
      if (experienceIds.length) {
        const experiences = await tx.experience.findMany({
          where: {
            id: { in: experienceIds },
            profileId: profile.id,
          },
          select: {
            id: true,
          },
        });

        if (experiences.length !== experienceIds.length) {
          throw new BadRequestException('One or more experiences are invalid.');
        }
      }

      // Validate Projects
      if (projectIds.length) {
        const projects = await tx.project.findMany({
          where: {
            id: { in: projectIds },
            profileId: profile.id,
          },
          select: {
            id: true,
          },
        });

        if (projects.length !== projectIds.length) {
          throw new BadRequestException('One or more projects are invalid.');
        }
      }

      // Validate Certificates
      if (certificateIds.length) {
        const certificates = await tx.certificate.findMany({
          where: {
            id: { in: certificateIds },
            profileId: profile.id,
          },
          select: {
            id: true,
          },
        });

        if (certificates.length !== certificateIds.length) {
          throw new BadRequestException(
            'One or more certificates are invalid.',
          );
        }
      }

      // Validate Educations
      if (educationIds.length) {
        const educations = await tx.education.findMany({
          where: {
            id: { in: educationIds },
            profileId: profile.id,
          },
          select: {
            id: true,
          },
        });

        if (educations.length !== educationIds.length) {
          throw new BadRequestException('One or more educations are invalid.');
        }
      }

      // Validate Languages
      if (languageIds.length) {
        const languages = await tx.language.findMany({
          where: {
            id: { in: languageIds },
            profileId: profile.id,
          },
          select: {
            id: true,
          },
        });

        if (languages.length !== languageIds.length) {
          throw new BadRequestException('One or more languages are invalid.');
        }
      }

      // Create Resume
      const resume = await tx.resume.create({
        data: {
          title: dto.title,
          template: dto.template,
          language: dto.language ?? 'EN',
          jobDescription: dto.jobDescription,
          generatedSummary: dto.generatedSummary?.trim() || profile.bio || null,
          profileId: profile.id,
        },
      });

      // Resume Skills
      if (skillIds.length) {
        await tx.resumeSkill.createMany({
          data: skillIds.map((skillId) => ({
            resumeId: resume.id,
            skillId,
          })),
        });
      }

      // Resume Experiences
      if (experienceIds.length) {
        await Promise.all(
          experienceIds.map((experienceId) =>
            tx.resumeExperience.create({
              data: {
                resumeId: resume.id,
                experienceId,
                customDescription:
                  dto.experienceDescriptions?.[experienceId] ?? [],
              },
            }),
          ),
        );
      }

      // Resume Projects
      if (projectIds.length) {
        await Promise.all(
          projectIds.map((projectId) =>
            tx.resumeProject.create({
              data: {
                resumeId: resume.id,
                projectId,
                customizedDescription:
                  dto.projectDescriptions?.[projectId] ?? '',
              },
            }),
          ),
        );
      }

      // Resume Educations
      if (educationIds.length) {
        await tx.resumeEducation.createMany({
          data: educationIds.map((educationId) => ({
            resumeId: resume.id,
            educationId,
          })),
        });
      }

      // Resume Certificates
      if (certificateIds.length) {
        await tx.resumeCertificate.createMany({
          data: certificateIds.map((certificateId) => ({
            resumeId: resume.id,
            certificateId,
          })),
        });
      }

      // Resume Languages
      if (languageIds.length) {
        await tx.resumeLanguage.createMany({
          data: languageIds.map((languageId) => ({
            resumeId: resume.id,
            languageId,
          })),
        });
      }

      return {
        message: 'Resume created successfully',
        id: resume.id,
      };
    });
  }

  /**
   * Creates a resume automatically optimized for a given job description.
   *
   * The method delegates the resume optimization process to the AI service,
   * which analyzes the job description and selects the most relevant user
   * skills, experiences, projects, education, certificates, and languages.
   *
   * The AI-generated data is then converted into a CreateResumeDto and passed
   * to the regular create() method. This ensures that both manually created
   * resumes and AI-generated resumes follow the same validation and persistence
   * logic.
   *
   * @param userId - The ID of the authenticated user.
   * @param jobDescription - The target job description used to optimize the resume.
   *
   * @returns The result of the resume creation process, including the created
   * resume ID and success message.
   *
   * @throws {NotFoundException} When the user's profile does not exist.
   * @throws {BadRequestException} When the AI returns invalid or unauthorized
   * related record IDs.
   */
  async createByJobDescription(userId: string, jobDescription: string) {
    const normalizedJobDescription = jobDescription.trim();

    const aiResume = await this.aiService.optimizeResume(
      userId,
      normalizedJobDescription,
    );

    const dto: CreateResumeDto = {
      title: 'AI Optimized Resume',
      template: ResumeTemplate.MODERN,

      jobDescription: normalizedJobDescription,

      generatedSummary: aiResume.summary,

      skillIds: aiResume.skillIds,

      experienceIds: aiResume.experienceIds,

      experienceDescriptions: aiResume.experienceDescriptions,

      projectIds: aiResume.projectIds,

      projectDescriptions: aiResume.projectDescriptions,

      educationIds: aiResume.educationIds,

      certificateIds: aiResume.certificateIds,

      languageIds: aiResume.languageIds,
    };

    return this.create(userId, dto);
  }

  /**
   * Retrieves all resumes belonging to the authenticated user.
   *
   * The method first resolves the user's profile and uses its ID to ensure
   * that only resumes associated with that profile are returned.
   *
   * @param userId - The ID of the authenticated user.
   *
   * @returns A list of resumes belonging to the user's profile.
   *
   * @throws {NotFoundException} When the user's profile does not exist.
   */
  async findAll(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.resume.findMany({
      where: {
        profileId: profile.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * Retrieves a single resume with all of its related profile data.
   *
   * The method first verifies that the authenticated user has a profile,
   * then retrieves the requested resume only if it belongs to that profile.
   *
   * The returned resume includes all associated skills, experiences,
   * projects, certificates, languages, and educations.
   *
   * @param userId - The ID of the authenticated user.
   * @param resumeId - The ID of the resume to retrieve.
   *
   * @returns The requested resume with all of its related data.
   *
   * @throws {NotFoundException} When the user's profile does not exist.
   * @throws {NotFoundException} When the resume does not exist or does not
   * belong to the authenticated user.
   */
  async findOne(userId: string, resumeId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const resume = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        profileId: profile.id,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        experiences: {
          include: {
            experience: true,
          },
        },
        projects: {
          include: {
            project: true,
          },
        },
        certificates: {
          include: {
            certificate: true,
          },
        },
        languages: {
          include: {
            language: true,
          },
        },
        educations: {
          include: {
            education: true,
          },
        },
      },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return resume;
  }

  /**
   * Updates an existing resume and its associated profile data.
   *
   * The method verifies that the authenticated user owns the requested resume,
   * validates all related entity IDs against the user's profile, and updates
   * the resume and its relations inside a single database transaction.
   *
   * When relation IDs are provided, the existing relations are replaced with
   * the new ones. This allows the client to fully control the resume content.
   *
   * @param userId - The ID of the authenticated user.
   * @param resumeId - The ID of the resume to update.
   * @param dto - The data used to update the resume.
   *
   * @returns The updated resume including all related data.
   *
   * @throws {NotFoundException} When the user's profile does not exist.
   * @throws {NotFoundException} When the resume does not exist or does not
   * belong to the authenticated user.
   * @throws {BadRequestException} When one or more related entity IDs are
   * invalid or do not belong to the user's profile.
   */
  async update(userId: string, resumeId: string, dto: UpdateResumeDto) {
    // Check if profile exists
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Check if resume exists and belongs to the user
    const resume = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        profileId: profile.id,
      },
      select: { id: true },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    // Normalize optional arrays
    const skillIds = dto.skillIds ?? [];
    const experienceIds = dto.experienceIds ?? [];
    const projectIds = dto.projectIds ?? [];
    const certificateIds = dto.certificateIds ?? [];
    const educationIds = dto.educationIds ?? [];
    const languageIds = dto.languageIds ?? [];

    return this.prisma.$transaction(async (tx) => {
      // Validate Skills
      const skills = await tx.skill.findMany({
        where: {
          id: { in: skillIds },
          profileId: profile.id,
        },
        select: { id: true },
      });

      if (skills.length !== skillIds.length) {
        throw new BadRequestException('One or more skills are invalid.');
      }

      // Validate Experiences
      const experiences = await tx.experience.findMany({
        where: {
          id: { in: experienceIds },
          profileId: profile.id,
        },
        select: { id: true },
      });

      if (experiences.length !== experienceIds.length) {
        throw new BadRequestException('One or more experiences are invalid.');
      }

      // Validate Projects
      const projects = await tx.project.findMany({
        where: {
          id: { in: projectIds },
          profileId: profile.id,
        },
        select: { id: true },
      });

      if (projects.length !== projectIds.length) {
        throw new BadRequestException('One or more projects are invalid.');
      }

      // Validate Certificates
      const certificates = await tx.certificate.findMany({
        where: {
          id: { in: certificateIds },
          profileId: profile.id,
        },
        select: { id: true },
      });

      if (certificates.length !== certificateIds.length) {
        throw new BadRequestException('One or more certificates are invalid.');
      }

      // Validate Educations
      const educations = await tx.education.findMany({
        where: {
          id: { in: educationIds },
          profileId: profile.id,
        },
        select: { id: true },
      });

      if (educations.length !== educationIds.length) {
        throw new BadRequestException('One or more educations are invalid.');
      }

      // Validate Languages
      const languages = await tx.language.findMany({
        where: {
          id: { in: languageIds },
          profileId: profile.id,
        },
        select: { id: true },
      });

      if (languages.length !== languageIds.length) {
        throw new BadRequestException('One or more languages are invalid.');
      }

      // Update Resume
      await tx.resume.update({
        where: {
          id: resume.id,
        },
        data: {
          ...(dto.title !== undefined && {
            title: dto.title,
          }),
          ...(dto.template !== undefined && {
            template: dto.template,
          }),
          ...(dto.jobDescription !== undefined && {
            jobDescription: dto.jobDescription,
          }),
          ...(dto.generatedSummary !== undefined && {
            generatedSummary: dto.generatedSummary,
          }),
        },
      });

      // Skills
      if (dto.skillIds !== undefined) {
        await tx.resumeSkill.deleteMany({
          where: {
            resumeId: resume.id,
          },
        });

        if (skillIds.length > 0) {
          await tx.resumeSkill.createMany({
            data: skillIds.map((skillId) => ({
              resumeId: resume.id,
              skillId,
            })),
          });
        }
      }

      // Experiences
      if (dto.experienceIds !== undefined) {
        await tx.resumeExperience.deleteMany({
          where: {
            resumeId: resume.id,
          },
        });

        if (experienceIds.length > 0) {
          await tx.resumeExperience.createMany({
            data: experienceIds.map((experienceId) => ({
              resumeId: resume.id,
              experienceId,
              customDescription:
                dto.experienceDescriptions?.[experienceId] ?? [],
            })),
          });
        }
      }

      // Projects
      if (dto.projectIds !== undefined) {
        await tx.resumeProject.deleteMany({
          where: {
            resumeId: resume.id,
          },
        });

        if (projectIds.length > 0) {
          await tx.resumeProject.createMany({
            data: projectIds.map((projectId) => ({
              resumeId: resume.id,
              projectId,
              customizedDescription: dto.projectDescriptions?.[projectId] ?? '',
            })),
          });
        }
      }

      // Educations
      if (dto.educationIds !== undefined) {
        await tx.resumeEducation.deleteMany({
          where: {
            resumeId: resume.id,
          },
        });

        if (educationIds.length > 0) {
          await tx.resumeEducation.createMany({
            data: educationIds.map((educationId) => ({
              resumeId: resume.id,
              educationId,
            })),
          });
        }
      }

      // Certificates
      if (dto.certificateIds !== undefined) {
        await tx.resumeCertificate.deleteMany({
          where: {
            resumeId: resume.id,
          },
        });

        if (certificateIds.length > 0) {
          await tx.resumeCertificate.createMany({
            data: certificateIds.map((certificateId) => ({
              resumeId: resume.id,
              certificateId,
            })),
          });
        }
      }

      // Languages
      if (dto.languageIds !== undefined) {
        await tx.resumeLanguage.deleteMany({
          where: {
            resumeId: resume.id,
          },
        });

        if (languageIds.length > 0) {
          await tx.resumeLanguage.createMany({
            data: languageIds.map((languageId) => ({
              resumeId: resume.id,
              languageId,
            })),
          });
        }
      }

      // Return updated resume
      return tx.resume.findUnique({
        where: {
          id: resume.id,
        },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          experiences: {
            include: {
              experience: true,
            },
          },
          projects: {
            include: {
              project: true,
            },
          },
          certificates: {
            include: {
              certificate: true,
            },
          },
          languages: {
            include: {
              language: true,
            },
          },
          educations: {
            include: {
              education: true,
            },
          },
        },
      });
    });
  }

  /**
   * Deletes a resume belonging to the authenticated user.
   *
   * The resume is deleted only when it belongs to the user's profile.
   *
   * @param userId - The ID of the authenticated user.
   * @param resumeId - The ID of the resume to delete.
   *
   * @returns The deleted resume.
   *
   * @throws {NotFoundException} When the resume does not exist or does not
   * belong to the authenticated user.
   */
  async remove(userId: string, resumeId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        profile: {
          userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return this.prisma.resume.delete({
      where: {
        id: resume.id,
      },
    });
  }
}
