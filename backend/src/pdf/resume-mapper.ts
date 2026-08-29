interface CvLink {
  type: string;
  url: string;
}

/**
 * Converts an ISO date string to "Jan 2024" format.
 */
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Converts an employment type enum such as "FULL_TIME"
 * into a readable format such as "Full Time".
 */
function formatEmploymentType(type?: string | null): string {
  if (!type) return '';

  return type
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Maps the resume response returned by getOneResume
 * into the cvData structure expected by PdfGenerator.
 *
 * @param resume Resume response including Prisma relations.
 * @param profile Profile data containing personal information.
 */
export function mapResumeToCvData(resume: any, profile?: any) {
  try {
    if (!resume) {
      throw new Error('Resume data is required.');
    }

    return {
      // Header
      fullName: `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim(),

      title: profile?.headline || resume.title || '',

      email: profile?.contactInfo?.email || '',

      phone: profile?.contactInfo?.phone || '',

      location: profile?.contactInfo?.city || '',

      links: (profile?.contactInfo?.links || [])
        .map((link: any) => {
          const url = typeof link === 'string' ? link : link?.url;

          if (!url || typeof url !== 'string') {
            return null;
          }

          const type =
            typeof link === 'object' && link?.type
              ? link.type
              : url.includes('github')
                ? 'GitHub'
                : url.includes('linkedin')
                  ? 'LinkedIn'
                  : url.includes('portfolio')
                    ? 'Portfolio'
                    : 'Website';

          return {
            type,
            url,
          };
        })
        .filter(Boolean),

      // Summary
      summary: resume.generatedSummary || '',

      // Skills
      skills: (resume.skills || [])
        .map((s: any) => s.skill?.name)
        .filter(Boolean),

      // Experience
      experiences: (resume.experiences || []).map((e: any) => {
        const exp = e.experience || {};

        const bullets: string[] =
          e.customDescription?.length > 0
            ? e.customDescription
            : exp.description || [];

        return {
          jobTitle: exp.position || '',

          companyName: exp.company || '',

          location: exp.location || '',

          startDate: formatDate(exp.startDate),

          endDate: exp.currentlyWorking ? 'Present' : formatDate(exp.endDate),

          currentlyWorking: !!exp.currentlyWorking,

          employmentType: formatEmploymentType(exp.employmentType),

          links: [] as CvLink[],

          description: bullets.map((item) => `• ${item}`).join('\n'),
        };
      }),

      // Projects
      projects: (resume.projects || []).map((p: any) => {
        const proj = p.project || {};

        const links: CvLink[] = [];

        if (proj.github) {
          links.push({
            type: 'GitHub',
            url: proj.github,
          });
        }

        if (proj.liveDemo) {
          links.push({
            type: 'Live Demo',
            url: proj.liveDemo,
          });
        }

        return {
          title: proj.name || '',

          description: p.customizedDescription || proj.description || '',

          startDate: formatDate(proj.startDate),

          endDate: proj.endDate ? formatDate(proj.endDate) : 'Present',

          currentlyOngoing: !proj.endDate,

          links,

          technologies: proj.technologies || [],
        };
      }),

      // Education
      education: (resume.educations || []).map((ed: any) => {
        const edu = ed.education || {};

        return {
          degree: edu.degree || '',

          fieldOfStudy: edu.field || '',

          schoolName: edu.university || '',

          location: '',

          grade: edu.grade || '',

          startDate: formatDate(edu.startDate),

          endDate: formatDate(edu.endDate),

          currentlyStudying: !edu.endDate,

          description: edu.description || '',
        };
      }),

      // Languages
      languages: (resume.languages || []).map((l: any) => ({
        language: l.language?.language || '',

        level: l.language?.level || '',
      })),

      // Certificates
      certificates: (resume.certificates || []).map((c: any) => {
        const cert = c.certificate || {};

        return {
          name: cert.name || '',

          issuer: cert.issuer || '',

          date: formatDate(cert.issueDate),

          url: cert.credentialUrl || '',

          summary: cert.credentialId
            ? `Credential ID: ${cert.credentialId}`
            : '',
        };
      }),
    };
  } catch (error) {
    console.error('Failed to map resume to CV data:', error);

    if (error instanceof Error) {
      throw new Error(`Failed to map resume data: ${error.message}`);
    }

    throw new Error('Failed to map resume data.');
  }
}
