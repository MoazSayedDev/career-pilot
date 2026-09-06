import { convertArabic } from 'arabic-reshaper';
import bidiFactory from 'bidi-js';

/**
 * Arabic text pipeline for PDF generation.
 *
 * PDF has no text shaping: Arabic must be converted to its presentation
 * forms (arabic-reshaper) and reordered into visual order (bidi-js)
 * before pdfmake draws it. Latin-only strings pass through unchanged.
 */
const bidi = bidiFactory();

const ARABIC_RANGE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function shapeText(text: string, language: 'EN' | 'AR'): string {
  if (!text || language !== 'AR') return text;

  if (!ARABIC_RANGE.test(text)) return text;

  try {
    const reshaped = convertArabic(text);

    return bidi.getReorderedString(
      reshaped,
      bidi.getEmbeddingLevels(reshaped, 'rtl'),
    );
  } catch {
    // Shaping must never break PDF output — worst case the original
    // (unshaped) string is drawn.
    return text;
  }
}

/** Recursively shape every string inside a pdfmake content tree. */
export function shapeContent(node: unknown, language: 'EN' | 'AR'): unknown {
  if (language !== 'AR') return node;

  if (typeof node === 'string') return shapeText(node, language);

  if (Array.isArray(node)) {
    return node.map((item) => shapeContent(item, language));
  }

  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      // pdfmake metadata keys that must stay untouched.
      if (key === 'link' || key === 'canvas' || key === 'width' || key === 'fontSize') {
        out[key] = value;
        continue;
      }

      out[key] = shapeContent(value, language);
    }

    return out;
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
  FACEBOOK: 'فيسبوك',
  TWITTER: 'تويتر',
  OTHER: 'رابط',
  WEBSITE: 'موقع',
  'Live Demo': 'عرض مباشر',
};

export function formatArabicDate(dateStr?: string | null): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('ar-EG', {
    month: 'long',
    year: 'numeric',
  });
}
