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

/**
 * A single entry inside a section (one job, one project, ...).
 *
 * head -> the title row(s). Always kept together with the first body node.
 * body -> description lines etc. Only the FIRST node is glued to the head;
 *         the rest can flow onto the next page.
 */
interface ItemBlock {
  head: Content[];
  body: Content[];
}

/* -------------------------------------------------------------------------- */
/* Look & feel constants (the only place you need to touch to tweak the style) */
/* -------------------------------------------------------------------------- */

const A4_WIDTH = 595.28;

/** Item titles (job, project, degree...) are this much bigger than body text */
const ITEM_TITLE_EXTRA = 1;

const DOT_COLOR = '#999999';
const SEPARATOR_COLOR = '#777777';
const SECTION_RULE_COLOR = '#D9D9D9';

/**
 * true  -> Arabic (Native)  •  English (Professional)   (one line)
 * false -> one language per line
 */
const LANGUAGES_INLINE = true;

/** Matches a leading bullet marker such as "• ", "- ", "– " or "* " */
const BULLET_PATTERN = /^[•\-–*·]\s+/;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function linkLabel(type?: string): string {
  if (!type) return 'Website';

  const normalized = type.toLowerCase();

  if (normalized.includes('github')) return 'GitHub';
  if (normalized.includes('linkedin')) return 'LinkedIn';
  if (normalized.includes('portfolio')) return 'Portfolio';
  if (normalized.includes('live')) return 'Live Demo';
  if (normalized.includes('website')) return 'Website';

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
        color: DOT_COLOR,
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

/**
 * Works out the printable width from pageMargins
 * (number | [horizontal, vertical] | [left, top, right, bottom]).
 */
function getContentWidth(margins: unknown): number {
  if (typeof margins === 'number') {
    return A4_WIDTH - margins * 2;
  }

  if (Array.isArray(margins)) {
    if (margins.length === 2) {
      return A4_WIDTH - Number(margins[0]) * 2;
    }

    if (margins.length === 4) {
      return A4_WIDTH - Number(margins[0]) - Number(margins[2]);
    }
  }

  return A4_WIDTH - 80;
}

function dateRange(start?: string, end?: string, ongoing?: boolean): string {
  return [start, end || (ongoing ? 'Present' : '')].filter(Boolean).join(' - ');
}

/**
 * Splits a multi-line description into separate paragraphs so that
 * long descriptions can break between lines instead of jumping
 * to the next page as one huge block.
 */
function splitParagraphs(text?: string): string[] {
  if (!text) return [];

  return text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * "NATIVE" -> "Native", "PROFESSIONAL_WORKING" -> "Professional working"
 */
function formatLevel(level?: string): string {
  const cleaned = (level || '').replace(/[_-]+/g, ' ').trim().toLowerCase();

  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : '';
}

/**
 * "ENGLISH" / "english" -> "English"
 */
function formatLanguageName(name?: string): string {
  return (name || '')
    .trim()
    .toLowerCase()
    .replace(
      /(^|[\s-])(\p{L})/gu,
      (_, sep: string, ch: string) => sep + ch.toUpperCase(),
    );
}

function appendPart(parts: Content[], part: Content, separator: Content): void {
  if (parts.length) {
    parts.push(separator);
  }

  parts.push(part);
}

/* -------------------------------------------------------------------------- */
/* Generator                                                                  */
/* -------------------------------------------------------------------------- */

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

    const contentWidth = getContentWidth(preset.pageMargins);

    const dot: Content = { text: '  •  ', color: DOT_COLOR };
    const dash: Content = { text: ' - ', color: SEPARATOR_COLOR };
    const pipe: Content = { text: ' | ', color: SEPARATOR_COLOR };

    /* ------------------------------------------------------------------ */
    /* Small builders                                                     */
    /* ------------------------------------------------------------------ */

    const sectionHeader = (label: string): Content => ({
      stack: [
        {
          text: label,
          font: preset.family,
          fontSize: preset.sectionSize,
          bold: true,
          color: preset.accent,
          characterSpacing: 1,
          margin: [0, preset.sectionGap, 0, 3],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: contentWidth,
              y2: 0,
              lineWidth: 0.5,
              lineColor: SECTION_RULE_COLOR,
            },
          ],
          margin: [0, 0, 0, 6],
        },
      ],
    });

    const bodyText = (
      text: string | Content[],
      extra: Record<string, unknown> = {},
    ): Content =>
      ({
        text,
        font: preset.family,
        fontSize: preset.bodySize,
        color: preset.textColor,
        lineHeight: preset.lineHeight,
        margin: [0, 2, 0, 0],
        ...extra,
      }) as Content;

    const smallText = (
      text: string,
      color: string,
      extra: Record<string, unknown> = {},
    ): Content =>
      ({
        text,
        font: preset.family,
        fontSize: preset.smallSize,
        color,
        margin: [0, 2, 0, 0],
        ...extra,
      }) as Content;

    const rightText = (text: string, marginTop = 0): Content =>
      ({
        text,
        font: preset.family,
        fontSize: preset.smallSize,
        color: preset.mutedColor,
        alignment: 'right',
        noWrap: true,
        margin: [0, marginTop, 0, 0],
      }) as Content;

    /**
     * Title on the left, date / meta on the right.
     */
    const titleRow = (left: Content[], right: Content[] = []): Content => {
      const columns: Content[] = [
        {
          width: '*',
          text: left,
          font: preset.family,
          fontSize: preset.bodySize + ITEM_TITLE_EXTRA,
          color: preset.textColor,
        } as Content,
      ];

      if (right.length) {
        columns.push({
          width: 'auto',
          stack: right,
        } as Content);
      }

      return {
        columns,
        columnGap: 10,
      };
    };

    /**
     * Lines that start with a bullet character ("•", "-", "–", "*") are
     * rendered as real list items so wrapped lines get a hanging indent.
     */
    const descriptionNodes = (text?: string): Content[] =>
      splitParagraphs(text).map((paragraph) => {
        const match = paragraph.match(BULLET_PATTERN);

        if (!match) {
          return bodyText(paragraph);
        }

        return {
          ul: [
            {
              text: paragraph.slice(match[0].length),
              font: preset.family,
              fontSize: preset.bodySize,
              color: preset.textColor,
              lineHeight: preset.lineHeight,
            },
          ],
          markerColor: preset.mutedColor,
          margin: [0, 2, 0, 0],
        } as Content;
      });

    /* ------------------------------------------------------------------ */
    /* Page-break helpers                                                 */
    /* ------------------------------------------------------------------ */

    const content: Content[] = [];

    /**
     * Adds a list-like section (experience, projects, ...).
     *
     * Page-break rules:
     *  1. The section title is glued to the FIRST item, so a title is never
     *     left alone at the bottom of a page.
     *  2. Each item's title row is glued to its first body line, so a job
     *     title is never separated from its description.
     *  3. The remaining lines of a long description CAN flow to the next
     *     page (no big empty gaps at the bottom of a page).
     */
    const addSection = (label: string, blocks: ItemBlock[]): void => {
      blocks.forEach((block, index) => {
        const [firstBody, ...restBody] = block.body;

        content.push({
          unbreakable: true,
          stack: [
            ...(index === 0 ? [sectionHeader(label)] : []),
            ...block.head,
            ...(firstBody ? [firstBody] : []),
          ],
          margin: [0, 0, 0, restBody.length ? 0 : preset.itemGap],
        });

        if (restBody.length) {
          content.push({
            stack: restBody,
            margin: [0, 0, 0, preset.itemGap],
          });
        }
      });
    };

    /**
     * Adds a short section (summary, skills, languages) as one block
     * together with its title.
     */
    const addShortSection = (label: string, nodes: Content[]): void => {
      content.push({
        unbreakable: true,
        stack: [sectionHeader(label), ...nodes],
        margin: [0, 0, 0, preset.itemGap],
      });
    };

    /* ------------------------------------------------------------------ */
    /* HEADER                                                             */
    /* ------------------------------------------------------------------ */

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
      appendPart(
        contactParts,
        {
          text: cvData.email,
          link: `mailto:${cvData.email}`,
          color: preset.mutedColor,
        },
        dot,
      );
    }

    if (cvData.phone) {
      appendPart(
        contactParts,
        { text: cvData.phone, color: preset.mutedColor },
        dot,
      );
    }

    if (cvData.location) {
      appendPart(
        contactParts,
        { text: cvData.location, color: preset.mutedColor },
        dot,
      );
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
     * Accent line under the header
     */
    headerStack.push({
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: contentWidth,
          y2: 0,
          lineWidth: 1,
          lineColor: preset.accent,
        },
      ],
      margin: [0, 6, 0, 4],
    });

    content.push(...headerStack);

    /* ------------------------------------------------------------------ */
    /* SUMMARY                                                            */
    /* ------------------------------------------------------------------ */

    if (cvData.summary?.trim()) {
      addShortSection('SUMMARY', [
        bodyText(cvData.summary, { margin: [0, 0, 0, 2] }),
      ]);
    }

    /* ------------------------------------------------------------------ */
    /* EXPERIENCE                                                         */
    /* ------------------------------------------------------------------ */

    if (cvData.experiences?.length) {
      const blocks: ItemBlock[] = cvData.experiences.map((exp) => {
        /*
         * Full Stack Developer - Tech Solutions | Cairo
         */
        const titleParts: Content[] = [];

        if (exp.jobTitle) {
          appendPart(titleParts, { text: exp.jobTitle, bold: true }, dash);
        }

        if (exp.companyName) {
          appendPart(titleParts, { text: exp.companyName }, dash);
        }

        if (exp.location) {
          appendPart(
            titleParts,
            { text: exp.location, color: preset.mutedColor },
            pipe,
          );
        }

        /*
         * Jan 2024 - Present
         * Full Time
         */
        const dateText = dateRange(
          exp.startDate,
          exp.endDate,
          exp.currentlyWorking,
        );

        const right: Content[] = [];

        if (dateText) {
          right.push(rightText(dateText));
        }

        if (exp.employmentType) {
          right.push(rightText(exp.employmentType, 1));
        }

        return {
          head: [titleRow(titleParts, right)],
          body: descriptionNodes(exp.description),
        };
      });

      addSection('EXPERIENCE', blocks);
    }

    /* ------------------------------------------------------------------ */
    /* PROJECTS                                                           */
    /* ------------------------------------------------------------------ */

    if (cvData.projects?.length) {
      const blocks: ItemBlock[] = cvData.projects.map((project) => {
        const projectLinks = createLinkText(project.links, preset.accent);

        const titleParts: Content[] = [
          { text: project.title || '', bold: true },
        ];

        if (projectLinks) {
          titleParts.push(dot);
          titleParts.push(projectLinks);
        }

        const dateText = dateRange(
          project.startDate,
          project.endDate,
          project.currentlyOngoing,
        );

        const body: Content[] = descriptionNodes(project.description);

        if (project.technologies?.length) {
          body.push(smallText(project.technologies.join(' • '), preset.accent));
        }

        return {
          head: [titleRow(titleParts, dateText ? [rightText(dateText)] : [])],
          body,
        };
      });

      addSection('PROJECTS', blocks);
    }

    /* ------------------------------------------------------------------ */
    /* EDUCATION                                                          */
    /* ------------------------------------------------------------------ */

    if (cvData.education?.length) {
      const comma: Content = { text: ', ' };

      const blocks: ItemBlock[] = cvData.education.map((education) => {
        /*
         * Bachelor of Science, Chemistry, Al-Azhar University
         */
        const titleParts: Content[] = [];

        if (education.degree) {
          appendPart(titleParts, { text: education.degree, bold: true }, comma);
        }

        if (education.fieldOfStudy) {
          appendPart(titleParts, { text: education.fieldOfStudy }, comma);
        }

        if (education.schoolName) {
          appendPart(
            titleParts,
            { text: education.schoolName, bold: true },
            comma,
          );
        }

        const dateText = dateRange(
          education.startDate,
          education.endDate,
          education.currentlyStudying,
        );

        const body: Content[] = [];

        if (education.grade) {
          body.push(smallText(`Grade: ${education.grade}`, preset.mutedColor));
        }

        body.push(...descriptionNodes(education.description));

        return {
          head: [titleRow(titleParts, dateText ? [rightText(dateText)] : [])],
          body,
        };
      });

      addSection('EDUCATION', blocks);
    }

    /* ------------------------------------------------------------------ */
    /* CERTIFICATES                                                       */
    /* ------------------------------------------------------------------ */

    if (cvData.certificates?.length) {
      const blocks: ItemBlock[] = cvData.certificates.map((certificate) => {
        /*
         * Docker & Kubernetes... - Udemy            May 2023
         *
         * The issuer itself becomes the clickable link.
         */
        const titleParts: Content[] = [
          { text: certificate.name || '', bold: true },
        ];

        if (certificate.issuer) {
          titleParts.push(dash);

          titleParts.push(
            certificate.url
              ? {
                  text: certificate.issuer,
                  link: certificate.url,
                  color: preset.accent,
                  decoration: 'underline' as const,
                }
              : {
                  text: certificate.issuer,
                  color: preset.mutedColor,
                },
          );
        }

        return {
          head: [
            titleRow(
              titleParts,
              certificate.date ? [rightText(certificate.date)] : [],
            ),
          ],
          body: certificate.summary
            ? [smallText(certificate.summary, preset.mutedColor)]
            : [],
        };
      });

      addSection('CERTIFICATES', blocks);
    }

    /* ------------------------------------------------------------------ */
    /* SKILLS                                                             */
    /* ------------------------------------------------------------------ */

    if (cvData.skills?.length) {
      addShortSection('SKILLS', [
        bodyText(cvData.skills.join('  •  '), { margin: [0, 0, 0, 0] }),
      ]);
    }

    /* ------------------------------------------------------------------ */
    /* LANGUAGES                                                          */
    /* ------------------------------------------------------------------ */

    if (cvData.languages?.length) {
      /*
       * English (Native)
       *
       * Name in bold, level in the muted colour.
       */
      const languageItems: Content[] = cvData.languages.map((language) => {
        const level = formatLevel(language.level);

        return {
          text: [
            { text: formatLanguageName(language.language), bold: true },
            ...(level
              ? [{ text: ` (${level})`, color: preset.mutedColor }]
              : []),
          ],
        } as Content;
      });

      if (LANGUAGES_INLINE) {
        const parts: Content[] = [];

        languageItems.forEach((item) => appendPart(parts, item, dot));

        addShortSection('LANGUAGES', [
          bodyText(parts, { margin: [0, 0, 0, 0] }),
        ]);
      } else {
        addShortSection(
          'LANGUAGES',
          languageItems.map((item) =>
            bodyText([item], { margin: [0, 0, 0, 3] }),
          ),
        );
      }
    }

    /* ------------------------------------------------------------------ */
    /* DOCUMENT                                                           */
    /* ------------------------------------------------------------------ */

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
       * Footer page number (only when there is more than one page).
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
