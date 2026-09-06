import type { PdfFontFamily } from './fonts';

export interface TemplatePreset {
  id: string;
  /** Base body font family (registered in fonts.ts). */
  family: PdfFontFamily;
  /** Font family used for the name + section headers. */
  headingFamily: PdfFontFamily;
  accent: string;
  textColor: string;
  mutedColor: string;
  headerStyle: 'bar' | 'plain' | 'centered' | 'rule';
  headingCase: 'normal' | 'uppercase';
  /** Page + vertical spacing tuning. */
  density: 'compact' | 'regular' | 'airy';
  nameSize: number;
  sectionSize: number;
  bodySize: number;
}

/**
 * Layout recipes for the eight CV templates. All of them stay
 * single-column with standard section order — the ATS-safe recipe
 * (resume.io / Indeed / Novoresume consensus) — and differ through
 * typography, color accents and header treatment only.
 */
export const TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  ATS_SAFE: {
    id: 'ATS_SAFE',
    family: 'Roboto',
    headingFamily: 'Roboto',
    accent: '#111827',
    textColor: '#111111',
    mutedColor: '#444444',
    headerStyle: 'plain',
    headingCase: 'uppercase',
    density: 'regular',
    nameSize: 20,
    sectionSize: 12,
    bodySize: 11,
  },
  MODERN: {
    id: 'MODERN',
    family: 'Roboto',
    headingFamily: 'Roboto',
    accent: '#1d4ed8',
    textColor: '#1a1a1a',
    mutedColor: '#4a4a4a',
    headerStyle: 'bar',
    headingCase: 'normal',
    density: 'regular',
    nameSize: 24,
    sectionSize: 13,
    bodySize: 11,
  },
  CLASSIC: {
    id: 'CLASSIC',
    family: 'RobotoSerif',
    headingFamily: 'RobotoSerif',
    accent: '#1f2937',
    textColor: '#1a1a1a',
    mutedColor: '#4a4a4a',
    headerStyle: 'centered',
    headingCase: 'uppercase',
    density: 'regular',
    nameSize: 22,
    sectionSize: 12.5,
    bodySize: 11,
  },
  MINIMAL: {
    id: 'MINIMAL',
    family: 'Roboto',
    headingFamily: 'Roboto',
    accent: '#374151',
    textColor: '#222222',
    mutedColor: '#6b7280',
    headerStyle: 'rule',
    headingCase: 'normal',
    density: 'airy',
    nameSize: 20,
    sectionSize: 11.5,
    bodySize: 10.5,
  },
  EXECUTIVE: {
    id: 'EXECUTIVE',
    family: 'RobotoSerif',
    headingFamily: 'RobotoSerif',
    accent: '#12264f',
    textColor: '#111827',
    mutedColor: '#4b5563',
    headerStyle: 'rule',
    headingCase: 'uppercase',
    density: 'regular',
    nameSize: 24,
    sectionSize: 12,
    bodySize: 11,
  },
  TECHNICAL: {
    id: 'TECHNICAL',
    family: 'Roboto',
    headingFamily: 'RobotoMono',
    accent: '#0f766e',
    textColor: '#1a1a1a',
    mutedColor: '#4a4a4a',
    headerStyle: 'bar',
    headingCase: 'uppercase',
    density: 'compact',
    nameSize: 20,
    sectionSize: 11.5,
    bodySize: 10.5,
  },
  ELEGANT: {
    id: 'ELEGANT',
    family: 'RobotoSerif',
    headingFamily: 'RobotoSerif',
    accent: '#9f1239',
    textColor: '#1f1a1a',
    mutedColor: '#5b4a4a',
    headerStyle: 'rule',
    headingCase: 'normal',
    density: 'airy',
    nameSize: 24,
    sectionSize: 13,
    bodySize: 11,
  },
  COMPACT: {
    id: 'COMPACT',
    family: 'Roboto',
    headingFamily: 'Roboto',
    accent: '#b45309',
    textColor: '#1a1a1a',
    mutedColor: '#4a4a4a',
    headerStyle: 'plain',
    headingCase: 'uppercase',
    density: 'compact',
    nameSize: 18,
    sectionSize: 11,
    bodySize: 10,
  },
};

export const DENSITY_SPACING: Record<
  TemplatePreset['density'],
  { pageMargins: [number, number, number, number]; sectionGap: number; itemGap: number; lineHeight: number }
> = {
  compact: { pageMargins: [32, 28, 32, 28], sectionGap: 9, itemGap: 4, lineHeight: 1.15 },
  regular: { pageMargins: [40, 36, 40, 36], sectionGap: 12, itemGap: 6, lineHeight: 1.2 },
  airy: { pageMargins: [52, 46, 52, 46], sectionGap: 16, itemGap: 8, lineHeight: 1.3 },
};

export function getPreset(templateId?: string | null): TemplatePreset {
  return TEMPLATE_PRESETS[templateId ?? 'MODERN'] ?? TEMPLATE_PRESETS.MODERN;
}
