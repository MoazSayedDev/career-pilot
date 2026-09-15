import * as fs from 'fs';
import * as path from 'path';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

type Vfs = Record<string, string>;

function findNodeModulesRoot(): string {
  const candidates = [
    path.join(process.cwd(), 'node_modules'),
    path.join(__dirname, '..', '..', '..', 'node_modules'),
    path.join(__dirname, '..', '..', 'node_modules'),
  ];

  return (
    candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0]
  );
}

function readTtf(relative: string): string {
  const absolute = path.join(findNodeModulesRoot(), relative);

  if (!fs.existsSync(absolute)) {
    throw new Error(`Required font file is missing: ${absolute}`);
  }

  return fs.readFileSync(absolute).toString('base64');
}

/**
 * We only generate English CVs.
 *
 * Roboto files are already included in pdfmake's VFS,
 * so we don't need Arabic/Cairo fonts anymore.
 */
const FONT_DEFINITIONS = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  },
};

let registered = false;

export function ensureFontsRegistered(): void {
  if (registered) return;

  const pdfMakeAny = pdfMake as any;

  const bundledVfs: Vfs = ((pdfFonts as any).vfs ?? pdfFonts) as Vfs;

  const vfs: Vfs = {
    ...bundledVfs,
  };

  /**
   * Keep these here only if your installed pdfmake package
   * does not contain the Roboto files in its bundled VFS.
   *
   * Otherwise pdfmake's bundled fonts are enough.
   */
  try {
    if (
      !vfs['Roboto-Regular.ttf'] ||
      !vfs['Roboto-Medium.ttf'] ||
      !vfs['Roboto-Italic.ttf'] ||
      !vfs['Roboto-MediumItalic.ttf']
    ) {
      const fontFiles: Record<string, string> = {
        'Roboto-Regular.ttf':
          '@expo-google-fonts/roboto/400Regular/Roboto_400Regular.ttf',

        'Roboto-Medium.ttf':
          '@expo-google-fonts/roboto/500Medium/Roboto_500Medium.ttf',

        'Roboto-Italic.ttf':
          '@expo-google-fonts/roboto/400Regular/Roboto_400Regular.ttf',

        'Roboto-MediumItalic.ttf':
          '@expo-google-fonts/roboto/500Medium/Roboto_500Medium.ttf',
      };

      for (const [name, relative] of Object.entries(fontFiles)) {
        if (!vfs[name]) {
          vfs[name] = readTtf(relative);
        }
      }
    }
  } catch {
    /**
     * If pdfmake already contains the fonts, this block is never needed.
     */
  }

  if (typeof pdfMakeAny.addVirtualFileSystem === 'function') {
    pdfMakeAny.addVirtualFileSystem(vfs);
    pdfMakeAny.addFonts(FONT_DEFINITIONS);
  } else {
    pdfMakeAny.vfs = vfs;
    pdfMakeAny.fonts = FONT_DEFINITIONS;
  }

  registered = true;
}

export type PdfFontFamily = 'Roboto';
