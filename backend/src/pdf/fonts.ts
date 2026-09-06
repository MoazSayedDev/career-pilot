import * as fs from 'fs';
import * as path from 'path';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

/**
 * Font registry for PDF generation.
 *
 * pdfmake's default bundle ships Roboto only. The template catalogue
 * needs a serif (Roboto Serif), a mono (Roboto Mono) and an Arabic
 * family (Cairo — full presentation-forms coverage for shaped text).
 * The TTFs come from the @expo-google-fonts packages and are registered
 * into pdfmake's virtual file system once, at module load.
 */

type Vfs = Record<string, string>;

function findNodeModulesRoot(): string {
  const candidates = [
    path.join(process.cwd(), 'node_modules'),
    path.join(__dirname, '..', '..', '..', 'node_modules'),
    path.join(__dirname, '..', '..', 'node_modules'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return candidates[0];
}

function readTtf(relative: string): string {
  const absolute = path.join(findNodeModulesRoot(), relative);

  if (!fs.existsSync(absolute)) {
    throw new Error(`Required font file is missing: ${absolute}`);
  }

  return fs.readFileSync(absolute).toString('base64');
}

const FONT_FILES: Record<string, string> = {
  'Cairo-Regular.ttf': path.join('@expo-google-fonts', 'cairo', '400Regular', 'Cairo_400Regular.ttf'),
  'Cairo-SemiBold.ttf': path.join('@expo-google-fonts', 'cairo', '600SemiBold', 'Cairo_600SemiBold.ttf'),
  'Cairo-Bold.ttf': path.join('@expo-google-fonts', 'cairo', '700Bold', 'Cairo_700Bold.ttf'),
  'RobotoSerif-Regular.ttf': path.join('@expo-google-fonts', 'roboto-serif', '400Regular', 'RobotoSerif_400Regular.ttf'),
  'RobotoSerif-Bold.ttf': path.join('@expo-google-fonts', 'roboto-serif', '700Bold', 'RobotoSerif_700Bold.ttf'),
  'RobotoMono-Regular.ttf': path.join('@expo-google-fonts', 'roboto-mono', '400Regular', 'RobotoMono_400Regular.ttf'),
  'RobotoMono-Bold.ttf': path.join('@expo-google-fonts', 'roboto-mono', '700Bold', 'RobotoMono_700Bold.ttf'),
};

const FONT_DEFINITIONS = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  },
  Cairo: {
    normal: 'Cairo-Regular.ttf',
    semibold: 'Cairo-SemiBold.ttf',
    bold: 'Cairo-Bold.ttf',
    italics: 'Cairo-Regular.ttf',
    bolditalics: 'Cairo-Bold.ttf',
  },
  RobotoSerif: {
    normal: 'RobotoSerif-Regular.ttf',
    bold: 'RobotoSerif-Bold.ttf',
    italics: 'RobotoSerif-Regular.ttf',
    bolditalics: 'RobotoSerif-Bold.ttf',
  },
  RobotoMono: {
    normal: 'RobotoMono-Regular.ttf',
    bold: 'RobotoMono-Bold.ttf',
    italics: 'RobotoMono-Regular.ttf',
    bolditalics: 'RobotoMono-Bold.ttf',
  },
};

function registerFonts(): void {
  const pdfMakeAny = pdfMake as any;

  // Existing Roboto bundle (pdfmake's own vfs) — its shape differs
  // between pdfmake versions: either { vfs: {...} } or the map itself.
  const bundledVfs: Vfs = ((pdfFonts as any).vfs ?? pdfFonts) as Vfs;
  const vfs: Vfs = { ...bundledVfs };

  for (const [name, relative] of Object.entries(FONT_FILES)) {
    vfs[name] = readTtf(relative);
  }

  // pdfmake's programmatic API (0.2+) exposes registration functions;
  // older/browser builds use plain vfs/fonts properties.
  if (typeof pdfMakeAny.addVirtualFileSystem === 'function') {
    pdfMakeAny.addVirtualFileSystem(vfs);
    pdfMakeAny.addFonts(FONT_DEFINITIONS);
  } else {
    pdfMakeAny.vfs = vfs;
    pdfMakeAny.fonts = FONT_DEFINITIONS;
  }
}

let registered = false;

export function ensureFontsRegistered(): void {
  if (registered) return;

  registerFonts();
  registered = true;
}

/** Family name (registered above) to use for a given template style. */
export type PdfFontFamily = 'Roboto' | 'Cairo' | 'RobotoSerif' | 'RobotoMono';
