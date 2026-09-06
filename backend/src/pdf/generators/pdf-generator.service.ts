import * as pdfMake from 'pdfmake/build/pdfmake';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';

import { ensureFontsRegistered } from '../fonts';
import {
  AR_EMPLOYMENT_TYPES,
  AR_LINK_TYPES,
  AR_SECTION_LABELS,
  formatArabicDate,
  shapeContent,
} from '../arabic';
import { DENSITY_SPACING, getPreset } from '../template-presets';

type CvData = Record<string, any>;
type CvLanguage = 'EN' | 'AR';

const PAGE_WIDTH = 595.28;

function linkLabel(type: string, language: CvLanguage): string {
  if (language === 'AR') {
    return AR_LINK_TYPES[type] ?? type;
  }

  // "GITHUB" / "LINKEDIN" enum-ish values become "Github" / "Linkedin".
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

export class PdfGenerator {
  /**
   * Renders the CV for a given template preset and language.
   * All templates keep the ATS-safe single-column structure; presets
   * vary typography, accent color, header treatment and density only.
   */
  static generatePdf(
    cvData: CvData,
    options: { templateId?: string | null; language?: CvLanguage } = {},
  ): Promise<Buffer> {
    ensureFontsRegistered();

    const preset = getPreset(options.templateId);
    const language: CvLanguage = options.language === 'AR' ? 'AR' : 'EN';
    const isAr = language === 'AR';
    const spacing = DENSITY_SPACING[preset.density];
    const baseAlignment: 'right' | 'left' = isAr ? 'right' : 'left';
    const contentWidth = PAGE_WIDTH - spacing.pageMargins[0] - spacing.pageMargins[2];
    const arabicFont = isAr ? { font: 'Cairo' } : {};

    const headingLabel = (en: string, arKey: keyof typeof AR_SECTION_LABELS) =>
      isAr ? AR_SECTION_LABELS[arKey] : preset.headingCase === 'uppercase' ? en.toUpperCase() : en;

    const sectionHeader = (label: string): Content => {
      const base: Content = {
        text: label,
        bold: true,
        fontSize: preset.sectionSize,
        color: preset.accent,
        alignment: preset.headerStyle === 'centered' ? 'center' : baseAlignment,
        margin: [0, spacing.sectionGap, 0, 3],
        ...(preset.headerStyle === 'centered' && !isAr && preset.headingFamily !== preset.family
          ? { font: preset.headingFamily }
          : {}),
        ...arabicFont,
      };

      if (preset.headerStyle === 'centered') {
        return {
          ...base,
          decoration: 'underline',
          decorationColor: preset.accent,
        } as Content;
      }

      const lineThickness = preset.headerStyle === 'bar' ? 2 : 0.75;
      const lineColor = preset.headerStyle === 'bar' ? preset.accent : preset.mutedColor;

      return {
        stack: [
          base,
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: contentWidth,
                y2: 0,
                lineWidth: lineThickness,
                lineColor,
              },
            ],
            margin: [0, 1, 0, 4],
          },
        ],
      } as Content;
    };

    const dateRange = (startIso?: string | null, endIso?: string | null, present?: boolean): string => {
      const start = isAr ? formatArabicDate(startIso) : formatEnDate(startIso);
      const end = present
        ? isAr
          ? AR_SECTION_LABELS.present
          : 'Present'
        : isAr
          ? formatArabicDate(endIso)
          : formatEnDate(endIso);

      return [start, end].filter(Boolean).join(isAr ? ' – ' : ' - ');
    };

    /* ---------- Header ---------- */

    const headerAlign = preset.headerStyle === 'centered' ? 'center' : baseAlignment;

    const headerStack: Content[] = [
      {
        text: cvData.fullName?.toUpperCase() || '',
        fontSize: preset.nameSize,
        bold: true,
        color: preset.textColor,
        alignment: headerAlign,
        ...(preset.headerStyle === 'centered' && preset.headingFamily !== preset.family
          ? { font: preset.headingFamily }
          : {}),
        ...arabicFont,
      },
      ...(cvData.title
        ? [
            {
              text: cvData.title,
              fontSize: preset.bodySize + 1,
              color: preset.headerStyle === 'bar' ? preset.accent : preset.mutedColor,
              bold: preset.headerStyle === 'bar',
              alignment: headerAlign,
              margin: [0, 1, 0, 0],
              ...arabicFont,
            } as Content,
          ]
        : []),
    ];

    const contactParts: Content[] = [];
    if (cvData.email) {
      contactParts.push({ text: cvData.email, link: `mailto:${cvData.email}`, color: preset.mutedColor });
    }
    if (cvData.phone) {
      if (contactParts.length) contactParts.push({ text: '  •  ', color: '#999999' });
      contactParts.push({ text: cvData.phone, color: preset.mutedColor });
    }
    if (cvData.location) {
      if (contactParts.length) contactParts.push({ text: '  •  ', color: '#999999' });
      contactParts.push({ text: cvData.location, color: preset.mutedColor });
    }
    if (contactParts.length) {
      headerStack.push({
        text: contactParts,
        fontSize: preset.bodySize - 2,
        alignment: headerAlign,
        margin: [0, 2, 0, 0],
      } as Content);
    }

    if ((cvData.links?.length ?? 0) > 0) {
      headerStack.push({
        text: cvData.links.flatMap((link: any, index: number) => [
          ...(index > 0 ? [{ text: '  •  ', color: '#999999' }] : []),
          {
            text: linkLabel(link.type, language),
            link: link.url,
            color: preset.accent,
            decoration: 'underline',
          },
        ]),
        fontSize: preset.bodySize - 2.5,
        alignment: headerAlign,
        margin: [0, 1, 0, 2],
      } as Content);
    }

    if (preset.headerStyle === 'bar' || preset.headerStyle === 'rule') {
      headerStack.push({
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: contentWidth,
            y2: 0,
            lineWidth: preset.headerStyle === 'bar' ? 2 : 0.75,
            lineColor: preset.headerStyle === 'bar' ? preset.accent : preset.mutedColor,
          },
        ],
        margin: [0, 3, 0, 2],
      } as Content);
    }

    const content: Content[] = [...headerStack];

    /* ---------- Summary ---------- */
    if (cvData.summary) {
      content.push(sectionHeader(headingLabel('SUMMARY', 'summary')));
      content.push({
        text: cvData.summary,
        alignment: baseAlignment,
        lineHeight: spacing.lineHeight,
        fontSize: preset.bodySize,
        margin: [0, 0, 0, 2],
      });
    }

    /* ---------- Experience ---------- */
    if (cvData.experiences?.length) {
      content.push(sectionHeader(headingLabel('PROFESSIONAL EXPERIENCE', 'experience')));

      for (const exp of cvData.experiences) {
        content.push({
          unbreakable: true,
          stack: [
            {
              text: [
                { text: exp.jobTitle || '' as any, bold: true, fontSize: preset.bodySize + 0.5, color: preset.textColor },
                ...(exp.companyName
                  ? [{ text: ` ${isAr ? 'في' : '-'} ${exp.companyName}`, color: preset.accent, fontSize: preset.bodySize }]
                  : []),
                ...(exp.location
                  ? [{ text: ` | ${exp.location}`, color: preset.mutedColor, fontSize: preset.bodySize - 1 }]
                  : []),
              ],
              alignment: baseAlignment,
              ...arabicFont,
            },
            {
              text: dateRange(exp.startDateIso, exp.endDateIso, exp.currentlyWorking),
              fontSize: preset.bodySize - 2,
              color: preset.mutedColor,
              alignment: baseAlignment,
              margin: [0, 0, 0, 1],
            },
            ...(exp.employmentType
              ? [
                  {
                    text: isAr
                      ? AR_EMPLOYMENT_TYPES[exp.employmentType] ?? exp.employmentType
                      : exp.employmentType,
                    fontSize: preset.bodySize - 2.5,
                    color: preset.mutedColor,
                    italics: !isAr,
                    alignment: baseAlignment,
                    margin: [0, 0, 0, 1],
                  } as Content,
                ]
              : []),
            ...(exp.description
              ? [
                  {
                    text: exp.description,
                    alignment: baseAlignment,
                    lineHeight: spacing.lineHeight,
                    fontSize: preset.bodySize - 0.5,
                    margin: [0, 1, 0, 0],
                  } as Content,
                ]
              : []),
          ],
          margin: [0, 0, 0, spacing.itemGap + 2],
        });
      }
    }

    /* ---------- Projects ---------- */
    if (cvData.projects?.length) {
      content.push(sectionHeader(headingLabel('PROJECTS', 'projects')));

      for (const project of cvData.projects) {
        content.push({
          unbreakable: true,
          stack: [
            {
              text: ([
                { text: project.title || '', bold: true, fontSize: preset.bodySize + 0.5, color: preset.textColor },
                ...((project.links ?? []) as any[]).flatMap((link, index) => [
                  { text: index === 0 ? '   —   ' : '  |  ', color: '#999999' },
                  {
                    text: linkLabel(link.type, language),
                    link: link.url,
                    color: preset.accent,
                    decoration: 'underline',
                    fontSize: preset.bodySize - 2,
                  },
                ])] as any),
              alignment: baseAlignment,
              ...arabicFont,
            },
            ...((project.technologies?.length ?? 0) > 0
              ? [
                  {
                    text: (project.technologies as string[]).join(isAr ? '، ' : ', '),
                    color: preset.accent,
                    fontSize: preset.bodySize - 1.5,
                    alignment: baseAlignment,
                    margin: [0, 0, 0, 1],
                  } as Content,
                ]
              : []),
            ...((project.startDateIso || project.endDateIso)
              ? [
                  {
                    text: dateRange(project.startDateIso, project.endDateIso, project.currentlyOngoing),
                    fontSize: preset.bodySize - 2,
                    color: preset.mutedColor,
                    alignment: baseAlignment,
                    margin: [0, 0, 0, 1],
                  } as Content,
                ]
              : []),
            ...(project.description
              ? [
                  {
                    text: project.description,
                    alignment: baseAlignment,
                    lineHeight: spacing.lineHeight,
                    fontSize: preset.bodySize - 0.5,
                    margin: [0, 1, 0, 0],
                  } as Content,
                ]
              : []),
          ],
          margin: [0, 0, 0, spacing.itemGap + 2],
        });
      }
    }

    /* ---------- Education ---------- */
    if (cvData.education?.length) {
      content.push(sectionHeader(headingLabel('EDUCATION', 'education')));

      for (const edu of cvData.education) {
        const degreeLine = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(isAr ? ' – ' : ' — ');
        content.push({
          unbreakable: true,
          stack: [
            {
              text: [
                { text: degreeLine, bold: true, fontSize: preset.bodySize + 0.5, color: preset.textColor },
                ...(edu.schoolName
                  ? [{ text: ` ${isAr ? 'في' : '-'} ${edu.schoolName}`, color: preset.accent, fontSize: preset.bodySize }]
                  : []),
              ],
              alignment: baseAlignment,
              ...arabicFont,
            },
            ...((edu.startDateIso || edu.endDateIso)
              ? [
                  {
                    text: dateRange(edu.startDateIso, edu.endDateIso, edu.currentlyStudying),
                    fontSize: preset.bodySize - 2,
                    color: preset.mutedColor,
                    alignment: baseAlignment,
                    margin: [0, 0, 0, 1],
                  } as Content,
                ]
              : []),
            ...(edu.description
              ? [
                  {
                    text: edu.description,
                    alignment: baseAlignment,
                    fontSize: preset.bodySize - 0.5,
                    lineHeight: spacing.lineHeight,
                    margin: [0, 1, 0, 0],
                  } as Content,
                ]
              : []),
          ],
          margin: [0, 0, 0, spacing.itemGap + 2],
        });
      }
    }

    /* ---------- Certificates ---------- */
    if (cvData.certificates?.length) {
      content.push(sectionHeader(headingLabel('CERTIFICATES', 'certificates')));

      for (const cert of cvData.certificates) {
        content.push({
          unbreakable: true,
          stack: [
            {
              text: [
                { text: cert.name || '', bold: true, fontSize: preset.bodySize + 0.5, color: preset.textColor },
                ...(cert.issuer
                  ? [{ text: ` ${isAr ? 'من' : '-'} ${cert.issuer}`, color: preset.accent, fontSize: preset.bodySize }]
                  : []),
              ],
              alignment: baseAlignment,
              ...arabicFont,
            },
            {
              text: [
                dateRange(cert.dateIso, cert.dateIso, false),
                cert.summary
                  ? `  •  ${isAr ? cert.summary.replace('Credential ID:', AR_SECTION_LABELS.credentialId + ':') : cert.summary}`
                  : '',
              ]
                .filter(Boolean)
                .join(''),
              fontSize: preset.bodySize - 2,
              color: preset.mutedColor,
              alignment: baseAlignment,
              margin: [0, 0, 0, 1],
            },
            ...(cert.url
              ? [
                  {
                    text: cert.url,
                    link: cert.url,
                    color: preset.accent,
                    decoration: 'underline',
                    fontSize: preset.bodySize - 2,
                    alignment: baseAlignment,
                  } as Content,
                ]
              : []),
          ],
          margin: [0, 0, 0, spacing.itemGap],
        });
      }
    }

    /* ---------- Skills ---------- */
    if (cvData.skills?.length) {
      content.push(sectionHeader(headingLabel('SKILLS', 'skills')));
      content.push({
        text: cvData.skills.join(isAr ? '، ' : '  •  '),
        fontSize: preset.bodySize,
        alignment: baseAlignment,
        lineHeight: spacing.lineHeight,
        ...arabicFont,
      });
    }

    /* ---------- Languages ---------- */
    if (cvData.languages?.length) {
      content.push(sectionHeader(headingLabel('LANGUAGES', 'languages')));
      content.push({
        text: cvData.languages
          .map((l: any) => `${l.language}${l.level ? (isAr ? ' – ' : ' — ') + l.level : ''}`)
          .join(isAr ? '، ' : '  •  '),
        fontSize: preset.bodySize,
        alignment: baseAlignment,
        lineHeight: spacing.lineHeight,
        ...arabicFont,
      });
    }

    const docDefinition: TDocumentDefinitions = {
      pageMargins: spacing.pageMargins,
      content: shapeContent(content, language) as Content[],
      defaultStyle: {
        font: isAr ? 'Cairo' : preset.family,
        fontSize: preset.bodySize,
        color: preset.textColor,
        lineHeight: spacing.lineHeight,
      },
    };

    const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition);

    return new Promise((resolve, reject) => {
      pdfDocGenerator.getBuffer(
        (buffer: Buffer) => resolve(buffer),
        (err: Error) => reject(err),
      );
    });
  }
}

function formatEnDate(dateStr?: string | null): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
