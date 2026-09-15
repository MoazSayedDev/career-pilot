import * as pdfMake from 'pdfmake/build/pdfmake';

import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

import { ensureFontsRegistered } from '../fonts';

import { getPreset } from '../template-presets';

interface CvLink {
  type: string;
  url: string;
}

interface CvExperience {
  jobTitle: string;
  companyName: string;
  location?: string;
  startDate?: string;
  startDateIso?: string | null;
  endDate?: string;
  endDateIso?: string | null;
  currentlyWorking?: boolean;
  employmentType?: string;
  links?: CvLink[];
  description?: string;
}

interface CvProject {
  title: string;
  description?: string;
  startDate?: string;
  startDateIso?: string | null;
  endDate?: string;
  endDateIso?: string | null;
  currentlyOngoing?: boolean;
  links?: CvLink[];
  technologies?: string[];
}

interface CvEducation {
  degree?: string;
  fieldOfStudy?: string;
  schoolName?: string;
  location?: string;
  grade?: string;
  startDate?: string;
  startDateIso?: string | null;
  endDate?: string;
  endDateIso?: string | null;
  currentlyStudying?: boolean;
  description?: string;
}

interface CvLanguage {
  language: string;
  level: string;
}

interface CvCertificate {
  name: string;
  issuer?: string;
  date?: string;
  dateIso?: string | null;
  url?: string;
  summary?: string;
}

/**
 * Keep this structure exactly compatible with the
 * object returned by mapResumeToCvData().
 */
export interface CvData {
  fullName?: string;
  title?: string;

  email?: string;
  phone?: string;
  location?: string;

  links?: CvLink[];

  summary?: string;

  skills?: string[];

  experiences?: CvExperience[];

  projects?: CvProject[];

  education?: CvEducation[];

  languages?: CvLanguage[];

  certificates?: CvCertificate[];
}

function linkLabel(type?: string): string {
  if (!type) return 'Website';

  const normalized = type.toLowerCase();

  if (normalized.includes('github')) {
    return 'GitHub';
  }

  if (normalized.includes('linkedin')) {
    return 'LinkedIn';
  }

  if (normalized.includes('portfolio')) {
    return 'Portfolio';
  }

  if (normalized.includes('live')) {
    return 'Live Demo';
  }

  if (normalized.includes('website')) {
    return 'Website';
  }

  return type;
}

function createLinkText(
  links: CvLink[] | undefined,
  accent: string,
): Content | null {
  if (!links?.length) {
    return null;
  }

  const parts: Content[] = [];

  links.forEach((link, index) => {
    if (index > 0) {
      parts.push({
        text: '  •  ',
        color: '#999999',
      });
    }

    parts.push({
      text: linkLabel(link.type),
      link: link.url,
      color: accent,
      decoration: 'underline',
    });
  });

  return {
    text: parts,
  };
}

export class PdfGenerator {
  static async generatePdf(
    cvData: CvData,
    options: {
      templateId?: string | null;
    } = {},
  ): Promise<Buffer> {
    ensureFontsRegistered();

    /*
     * There is only one template.
     *
     * We keep options.templateId only so existing callers
     * don't need to change.
     */
    const preset = getPreset(options.templateId);

    /*
     * ----------------------------------------------------
     * SECTION HEADER
     * ----------------------------------------------------
     */

    const sectionHeader = (label: string): Content => {
      return {
        stack: [
          {
            text: label,
            font: preset.family,
            fontSize: preset.sectionSize,
            bold: true,
            color: preset.mutedColor,
            margin: [0, preset.sectionGap, 0, 0],
          },

          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: 100,
                y2: 0,
                lineWidth: 0.5,
                lineColor: preset.accent,
              },
            ],
            margin: [0, 0, 0, 6],
          },
        ],
      };
    };

    /*
     * ----------------------------------------------------
     * HEADER
     * ----------------------------------------------------
     */

    const headerStack: Content[] = [
      {
        text: cvData.fullName?.toUpperCase() || '',

        font: preset.family,

        fontSize: preset.nameSize,

        bold: true,

        color: preset.textColor,

        alignment: 'center',
      },
    ];

    if (cvData.title) {
      headerStack.push({
        text: cvData.title,

        font: preset.family,

        fontSize: preset.titleSize,

        color: preset.mutedColor,

        alignment: 'center',

        margin: [0, 2, 0, 0],
      });
    }

    /*
     * Contact information
     */
    const contactParts: Content[] = [];

    if (cvData.email) {
      contactParts.push({
        text: cvData.email,

        link: `mailto:${cvData.email}`,

        color: preset.mutedColor,
      });
    }

    if (cvData.phone) {
      if (contactParts.length) {
        contactParts.push({
          text: '  •  ',

          color: '#999999',
        });
      }

      contactParts.push({
        text: cvData.phone,

        color: preset.mutedColor,
      });
    }

    if (cvData.location) {
      if (contactParts.length) {
        contactParts.push({
          text: '  •  ',

          color: '#999999',
        });
      }

      contactParts.push({
        text: cvData.location,

        color: preset.mutedColor,
      });
    }

    if (contactParts.length) {
      headerStack.push({
        text: contactParts,

        font: preset.family,

        fontSize: preset.smallSize,

        alignment: 'center',

        margin: [0, 4, 0, 0],
      });
    }

    /*
     * Social / portfolio links
     */
    const linksContent = createLinkText(cvData.links, preset.accent);

    if (linksContent) {
      headerStack.push({
        stack: [linksContent],

        font: preset.family,

        fontSize: preset.smallSize,

        alignment: 'center',

        margin: [0, 2, 0, 4],
      } as Content);
    }

    /*
     * Blue line under header
     */
    headerStack.push({
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 515.28,
          y2: 0,
          lineWidth: 1,
          lineColor: preset.accent,
        },
      ],
      margin: [0, 6, 0, 4],
    });

    /*
     * No line under header.
     */

    const content: Content[] = [...headerStack];

    /*
     * ----------------------------------------------------
     * SUMMARY
     * ----------------------------------------------------
     */

    if (cvData.summary?.trim()) {
      content.push(sectionHeader('SUMMARY'));

      content.push({
        text: cvData.summary,

        font: preset.family,

        fontSize: preset.bodySize,

        color: preset.textColor,

        lineHeight: preset.lineHeight,

        margin: [0, 0, 0, 2],
      });
    }

    /*
     * ----------------------------------------------------
     * EXPERIENCE
     * ----------------------------------------------------
     */

    if (cvData.experiences?.length) {
      content.push(sectionHeader('EXPERIENCE'));

      for (const exp of cvData.experiences) {
        const dateText = [exp.startDate, exp.endDate]
          .filter(Boolean)
          .join(' - ');

        /*
         * Full Stack Developer - Tech Solutions | Cairo
         */
        const titleParts: Content[] = [];

        if (exp.jobTitle) {
          titleParts.push({
            text: exp.jobTitle,

            bold: true,
          });
        }

        if (exp.companyName) {
          if (titleParts.length) {
            titleParts.push({
              text: ' - ',

              color: '#777777',
            });
          }

          titleParts.push({
            text: exp.companyName,
          });
        }

        if (exp.location) {
          if (titleParts.length) {
            titleParts.push({
              text: ' | ',

              color: '#777777',
            });
          }

          titleParts.push({
            text: exp.location,

            color: preset.mutedColor,
          });
        }

        /*
         * Complete experience item
         */
        const item: Content = {
          unbreakable: true,

          stack: [
            /*
             * ---------------------------------------------
             * TOP ROW
             *
             * LEFT:
             * Full Stack Developer - Tech Solutions | Cairo
             *
             * RIGHT:
             * Jan 2024 - Present
             * Full Time
             * ---------------------------------------------
             */
            {
              columns: [
                /*
                 * LEFT SIDE
                 */
                {
                  width: '*',

                  text: titleParts,

                  font: preset.family,

                  fontSize: 11.5,

                  color: preset.textColor,
                },

                /*
                 * RIGHT SIDE
                 */
                {
                  width: 'auto',

                  stack: [
                    /*
                     * Date
                     */
                    {
                      text: dateText,

                      font: preset.family,

                      fontSize: preset.smallSize,

                      color: preset.mutedColor,

                      alignment: 'right',

                      noWrap: true,
                    },

                    /*
                     * Employment type
                     */
                    ...(exp.employmentType
                      ? [
                          {
                            text: exp.employmentType,

                            font: preset.family,

                            fontSize: preset.smallSize,

                            color: preset.mutedColor,

                            alignment: 'right',

                            noWrap: true,

                            margin: [0, 1, 0, 0],
                          } as Content,
                        ]
                      : []),
                  ],
                },
              ],

              columnGap: 10,
            },

            /*
             * ---------------------------------------------
             * DESCRIPTION
             * ---------------------------------------------
             */
            ...(exp.description
              ? [
                  {
                    text: exp.description,

                    font: preset.family,

                    fontSize: preset.bodySize,

                    color: preset.textColor,

                    lineHeight: preset.lineHeight,

                    margin: [0, 3, 0, 0],
                  } as Content,
                ]
              : []),
          ],

          /*
           * Space between experiences
           */
          margin: [0, 0, 0, preset.itemGap],
        };

        content.push(item);
      }
    }

    /*
     * ----------------------------------------------------
     * PROJECTS
     * ----------------------------------------------------
     */

    if (cvData.projects?.length) {
      content.push(sectionHeader('PROJECTS'));

      for (const project of cvData.projects) {
        const dateText = [project.startDate, project.endDate]
          .filter(Boolean)
          .join(' - ');

        const projectLinks = createLinkText(project.links, preset.accent);

        const projectTitleParts: Content[] = [
          {
            text: project.title || '',

            bold: true,
          },
        ];

        if (projectLinks) {
          projectTitleParts.push({
            text: '  •  ',

            color: '#999999',
          });

          projectTitleParts.push(projectLinks as any);
        }

        const projectItem: Content = {
          unbreakable: true,

          stack: [
            {
              columns: [
                {
                  width: '*',

                  text: projectTitleParts,

                  font: preset.family,

                  fontSize: 12,

                  color: preset.textColor,
                },

                {
                  width: 'auto',

                  text: dateText,

                  font: preset.family,

                  fontSize: preset.smallSize,

                  color: preset.mutedColor,

                  alignment: 'right',
                },
              ],

              columnGap: 10,
            },

            ...(project.description
              ? [
                  {
                    text: project.description,

                    font: preset.family,

                    fontSize: preset.bodySize,

                    color: preset.textColor,

                    lineHeight: preset.lineHeight,

                    margin: [0, 2, 0, 0],
                  } as Content,
                ]
              : []),

            ...(project.technologies?.length
              ? [
                  {
                    text: project.technologies.join(' • '),

                    font: preset.family,

                    fontSize: preset.smallSize,

                    color: preset.accent,

                    margin: [0, 2, 0, 0],
                  } as Content,
                ]
              : []),
          ],

          margin: [0, 0, 0, preset.itemGap],
        };

        content.push(projectItem);
      }
    }

    /*
     * ----------------------------------------------------
     * EDUCATION
     * ----------------------------------------------------
     */

    if (cvData.education?.length) {
      content.push(sectionHeader('EDUCATION'));

      for (const education of cvData.education) {
        const dateText = [
          education.startDate,
          education.endDate || (education.currentlyStudying ? 'Present' : ''),
        ]
          .filter(Boolean)
          .join(' - ');

        const educationTitle: Content[] = [];

        // Degree
        if (education.degree) {
          educationTitle.push({
            text: education.degree,
            bold: true,
          });
        }

        // Field of study
        if (education.fieldOfStudy) {
          educationTitle.push({
            text: `, ${education.fieldOfStudy}`,
          });
        }

        // University / school
        if (education.schoolName) {
          educationTitle.push({
            text: `, ${education.schoolName}`,
            bold: true,
          });
        }

        const educationItem: Content = {
          unbreakable: true,

          stack: [
            /*
             * ---------------------------------------------
             * DEGREE + FIELD + UNIVERSITY       DATE
             * ---------------------------------------------
             *
             * Bachelor of Science, Chemistry, Al-Azhar University
             *                                      2022 - 2027
             */
            {
              columns: [
                {
                  width: '*',

                  text: educationTitle,

                  font: preset.family,

                  fontSize: 12,

                  color: preset.textColor,
                },

                {
                  width: 'auto',

                  text: dateText,

                  font: preset.family,

                  fontSize: preset.smallSize,

                  color: preset.mutedColor,

                  alignment: 'right',

                  noWrap: true,
                },
              ],

              columnGap: 10,
            },

            /*
             * ---------------------------------------------
             * GRADE
             * ---------------------------------------------
             */
            ...(education.grade
              ? [
                  {
                    text: `Grade: ${education.grade}`,

                    font: preset.family,

                    fontSize: preset.smallSize,

                    color: preset.mutedColor,

                    margin: [0, 2, 0, 0],
                  } as Content,
                ]
              : []),

            /*
             * ---------------------------------------------
             * DESCRIPTION
             * ---------------------------------------------
             */
            ...(education.description
              ? [
                  {
                    text: education.description,

                    font: preset.family,

                    fontSize: preset.bodySize,

                    color: preset.textColor,

                    lineHeight: preset.lineHeight,

                    margin: [0, 2, 0, 0],
                  } as Content,
                ]
              : []),
          ],

          margin: [0, 0, 0, preset.itemGap],
        };

        content.push(educationItem);
      }
    }
    /*
     * ----------------------------------------------------
     * CERTIFICATES
     * ----------------------------------------------------
     */

    if (cvData.certificates?.length) {
      content.push(sectionHeader('CERTIFICATES'));

      for (const certificate of cvData.certificates) {
        const issuerContent: Content[] = [];

        /*
         * Certificate name
         */
        issuerContent.push({
          text: certificate.name || '',

          bold: true,
        });

        /*
         * Issuer
         *
         * The issuer itself becomes the clickable link.
         */
        if (certificate.issuer) {
          issuerContent.push({
            text: ' - ',

            color: '#777777',
          });

          if (certificate.url) {
            issuerContent.push({
              text: certificate.issuer,

              link: certificate.url,

              color: preset.accent,

              decoration: 'underline' as const,
            });
          } else {
            issuerContent.push({
              text: certificate.issuer,

              color: preset.mutedColor,
            });
          }
        }

        const certificateItem: Content = {
          unbreakable: true,

          stack: [
            /*
             * ---------------------------------------------
             * Certificate name + issuer
             *                                      Date
             *
             * Docker & Kubernetes... - Udemy       May 2023
             * ---------------------------------------------
             */
            {
              columns: [
                {
                  width: '*',

                  text: issuerContent,

                  font: preset.family,

                  fontSize: 12,

                  color: preset.textColor,
                },

                /*
                 * Date on the right
                 */
                {
                  width: 'auto',

                  text: certificate.date || '',

                  font: preset.family,

                  fontSize: preset.smallSize,

                  color: preset.mutedColor,

                  alignment: 'right',

                  noWrap: true,
                },
              ],

              columnGap: 10,
            },

            /*
             * ---------------------------------------------
             * Credential ID / Summary
             * ---------------------------------------------
             */
            ...(certificate.summary
              ? [
                  {
                    text: certificate.summary,

                    font: preset.family,

                    fontSize: preset.smallSize,

                    color: preset.mutedColor,

                    margin: [0, 2, 0, 0],
                  } as Content,
                ]
              : []),
          ],

          margin: [0, 0, 0, preset.itemGap],
        };

        content.push(certificateItem);
      }
    }

    /*
     * ----------------------------------------------------
     * SKILLS
     * ----------------------------------------------------
     */

    if (cvData.skills?.length) {
      content.push(sectionHeader('SKILLS'));

      content.push({
        unbreakable: true,

        text: cvData.skills.join('  •  '),

        font: preset.family,

        fontSize: preset.bodySize,

        color: preset.textColor,

        lineHeight: preset.lineHeight,

        margin: [0, 0, 0, preset.itemGap],
      });
    }

    /*
     * ----------------------------------------------------
     * LANGUAGES
     * ----------------------------------------------------
     */

    if (cvData.languages?.length) {
      content.push(sectionHeader('LANGUAGES'));

      content.push({
        unbreakable: true,

        stack: cvData.languages.map((language) => ({
          text: `${language.language} — ${language.level}`,

          font: preset.family,

          fontSize: preset.bodySize,

          color: preset.textColor,

          margin: [0, 0, 0, 3],
        })),

        margin: [0, 0, 0, preset.itemGap],
      });
    }

    /*
     * ----------------------------------------------------
     * DOCUMENT
     * ----------------------------------------------------
     */

    const documentDefinition: TDocumentDefinitions = {
      pageSize: 'A4',

      pageMargins: preset.pageMargins,

      defaultStyle: {
        font: preset.family,

        fontSize: preset.bodySize,

        color: preset.textColor,

        lineHeight: preset.lineHeight,
      },

      content,

      /*
       * Footer page number.
       */
      footer: (currentPage, pageCount) => ({
        text: pageCount > 1 ? `${currentPage} / ${pageCount}` : '',

        alignment: 'center',

        font: preset.family,

        fontSize: 8,

        color: preset.mutedColor,

        margin: [0, 10, 0, 0],
      }),
    };

    const pdfMakeAny = pdfMake as any;

    return new Promise<Buffer>((resolve, reject) => {
      try {
        const pdfDoc = pdfMakeAny.createPdf(documentDefinition);

        pdfDoc.getBuffer((buffer: Buffer) => {
          resolve(buffer);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
