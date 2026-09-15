import { convertArabic } from 'arabic-reshaper';
import bidiFactory from 'bidi-js';

const bidi = bidiFactory();
const ARABIC_RANGE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function shapeText(text: string, language: 'EN' | 'AR'): string {
  if (!text || language !== 'AR' || !ARABIC_RANGE.test(text)) return text;

  const reshaped = convertArabic(text);
  return bidi.getReorderedString(reshaped, bidi.getEmbeddingLevels(reshaped, 'rtl'));
}

export function shapeContent(node: unknown, language: 'EN' | 'AR'): unknown {
  if (language !== 'AR') return node;
  if (typeof node === 'string') return shapeText(node, language);
  if (Array.isArray(node)) return node.map((item) => shapeContent(item, language));

  if (node && typeof node === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      output[key] = key === 'link' || key === 'canvas' || key === 'width' || key === 'fontSize'
        ? value
        : shapeContent(value, language);
    }
    return output;
  }

  return node;
}

export const AR_SECTION_LABELS = {
  summary: 'الملخص',
  experience: 'الخبرة المهنية',
  projects: 'المشاريع',
  education: 'التعليم',
  skills: 'المهارات',
  languages: 'اللغات',
  certificates: 'الشهادات',
  present: 'حتى الآن',
  credentialId: 'معرّف الاعتماد',
};

export const AR_EMPLOYMENT_TYPES: Record<string, string> = {
  'Full Time': 'دوام كامل',
  'Part Time': 'دوام جزئي',
  Contract: 'عقد مؤقت',
  Internship: 'تدريب',
  Freelance: 'عمل حر',
};

export const AR_LINK_TYPES: Record<string, string> = {
  LINKEDIN: 'لينكدإن',
  GITHUB: 'جيت هب',
  PORTFOLIO: 'معرض الأعمال',
  WEBSITE: 'موقع',
  'Live Demo': 'عرض مباشر',
};

export function formatArabicDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
}
