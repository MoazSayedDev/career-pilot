/**
 * Single source of truth for the CV template catalogue shared by the
 * landing showcase, the resume builder picker, and the live preview.
 *
 * Design rules (2025/2026 ATS research consensus — resume.io, Indeed,
 * Novoresume, Enhancv): every template stays single-column with standard
 * section headings and 10–12pt body type; templates differ through
 * typography, color accents, and header treatment — never through
 * tables, sidebars, or graphics that break ATS parsing.
 */

export type CvFontFamily = "sans" | "serif" | "mono";

export interface CvTemplatePreset {
  /** ResumeTemplate enum value stored on the resume record. */
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  /** True when the template avoids every risky visual (flagship ATS). */
  atsSafe: boolean;
  preview: {
    accent: string;
    headerStyle: "bar" | "plain" | "centered" | "rule";
    family: CvFontFamily;
    headingCase: "normal" | "uppercase";
    density: "compact" | "regular" | "airy";
  };
}

export const CV_TEMPLATES: CvTemplatePreset[] = [
  {
    id: "ATS_SAFE",
    nameAr: "آمن لأنظمة الفرز",
    nameEn: "ATS Safe",
    descAr: "أبيض وأسود خالص، هيكل قياسي 100% — يجتاز أي نظام فرز آلي.",
    descEn: "Pure black & white, 100% standard structure — passes any parser.",
    atsSafe: true,
    preview: { accent: "#111827", headerStyle: "plain", family: "sans", headingCase: "uppercase", density: "regular" },
  },
  {
    id: "MODERN",
    nameAr: "عصري",
    nameEn: "Modern",
    descAr: "لمسات زرقاء وعناوين بارزة — المظهر التقني المعاصر.",
    descEn: "Blue accents with bold headings — the contemporary tech look.",
    atsSafe: true,
    preview: { accent: "#1d4ed8", headerStyle: "bar", family: "sans", headingCase: "normal", density: "regular" },
  },
  {
    id: "CLASSIC",
    nameAr: "كلاسيكي",
    nameEn: "Classic",
    descAr: "طابع رسمي بخط مائل للسيريف وفواصل أنيقة.",
    descEn: "Formal serif-leaning type with elegant rules.",
    atsSafe: true,
    preview: { accent: "#1f2937", headerStyle: "centered", family: "serif", headingCase: "uppercase", density: "regular" },
  },
  {
    id: "MINIMAL",
    nameAr: "بسيط",
    nameEn: "Minimal",
    descAr: "مساحات واسعة وفواصل رفيعة — أقل ضجيج، أعلى وضوح.",
    descEn: "Generous whitespace with hairline dividers — quiet and clear.",
    atsSafe: true,
    preview: { accent: "#374151", headerStyle: "rule", family: "sans", headingCase: "normal", density: "airy" },
  },
  {
    id: "EXECUTIVE",
    nameAr: "تنفيذي",
    nameEn: "Executive",
    descAr: "كحلي داكن وخط واسع البُعد لمواقع القيادة العليا.",
    descEn: "Deep navy with letter-spaced headings for senior roles.",
    atsSafe: true,
    preview: { accent: "#12264f", headerStyle: "rule", family: "serif", headingCase: "uppercase", density: "regular" },
  },
  {
    id: "TECHNICAL",
    nameAr: "تقني",
    nameEn: "Technical",
    descAr: "كثيف ومنظم بعناوين رجلية — مثالي للمطورين والمهندسين.",
    descEn: "Dense, mono-accented headings — built for engineers.",
    atsSafe: true,
    preview: { accent: "#0f766e", headerStyle: "bar", family: "mono", headingCase: "uppercase", density: "compact" },
  },
  {
    id: "ELEGANT",
    nameAr: "أنيق",
    nameEn: "Elegant",
    descAr: "لمسات نبيذية دافئة بعناوين سيريف راقية.",
    descEn: "Warm burgundy accents over refined serif headings.",
    atsSafe: true,
    preview: { accent: "#9f1239", headerStyle: "rule", family: "serif", headingCase: "normal", density: "airy" },
  },
  {
    id: "COMPACT",
    nameAr: "مضغوط",
    nameEn: "Compact",
    descAr: "تباعد مضبوط يستوعب خبرة أطول في صفحة واحدة.",
    descEn: "Tuned spacing fits longer histories on one page.",
    atsSafe: true,
    preview: { accent: "#b45309", headerStyle: "plain", family: "sans", headingCase: "uppercase", density: "compact" },
  },
];

export const DEFAULT_CV_TEMPLATE_ID = "MODERN";

export const findCvTemplate = (id: string): CvTemplatePreset =>
  CV_TEMPLATES.find((t) => t.id === id) ?? CV_TEMPLATES[1];
