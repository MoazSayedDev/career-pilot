import type { PdfFontFamily } from './fonts';

export interface TemplatePreset {
  family: PdfFontFamily;

  accent: string;
  textColor: string;
  mutedColor: string;

  nameSize: number;
  titleSize: number;
  sectionSize: number;
  bodySize: number;

  smallSize: number;

  pageMargins: [number, number, number, number];

  sectionGap: number;
  itemGap: number;
  lineHeight: number;
}

export const TEMPLATE_PRESET: TemplatePreset = {
  family: 'Roboto',

  accent: '#1d4ed8',
  textColor: '#1a1a1a',
  mutedColor: '#4a4a4a',

  /*
   * Slightly larger than your old design.
   */
  nameSize: 26,
  titleSize: 12,
  sectionSize: 13,
  bodySize: 11.5,
  smallSize: 10,

  pageMargins: [40, 36, 40, 36],

  sectionGap: 12,
  itemGap: 7,
  lineHeight: 1.2,
};

/**
 * Kept for compatibility with existing code that may still
 * call getPreset(templateId).
 *
 * There is only ONE template now.
 */
export function getPreset(_templateId?: string | null): TemplatePreset {
  return TEMPLATE_PRESET;
}
