import type { Metadata } from "next";
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import "./globals.css";

import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  // Without this, next/font injects an Arial-backed fallback face that
  // claims every codepoint — it steals Arabic glyphs in EN mode before
  // Tajawal (next in the stack) is ever reached.
  adjustFontFallback: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  adjustFontFallback: false,
});

// Arabic UI font (same family used on gathern.co). Geist renders Latin
// glyphs first in the --font-sans stack; Tajawal covers Arabic.
const tajawal = Tajawal({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "CareerPilot",
  description: "AI-powered CV builder for modern job seekers",
};

/**
 * Applies the saved theme and language before first paint to avoid a
 * flash of the wrong theme or direction. Kept tiny and dependency-free.
 */
const themeBootstrap = `(function(){try{var t=localStorage.getItem("careerpilot_theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

const localeBootstrap = `(function(){try{var l=localStorage.getItem("careerpilot_lang");if(l!=="en"&&l!=="ar")l="ar";document.documentElement.lang=l;document.documentElement.dir=l==="ar"?"rtl":"ltr";if(l==="en"){var r=document.documentElement;var g=getComputedStyle(r).getPropertyValue("--font-geist-sans").trim();var a=getComputedStyle(r).getPropertyValue("--font-arabic").trim();var p=g.split(",")[0];if(p&&a)r.style.setProperty("--font-geist-sans",p+", "+a);}}catch(e){document.documentElement.lang="ar";document.documentElement.dir="rtl";}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Arabic is the default locale: correct for first paint, then kept
    // in sync by the I18nProvider when the user switches languages.
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${tajawal.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <script dangerouslySetInnerHTML={{ __html: localeBootstrap }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
