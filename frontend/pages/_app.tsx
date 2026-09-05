import type { AppProps } from "next/app";

import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

/**
 * The reusable page components in `src/pages/**` are also picked up by
 * the legacy Pages Router (e.g. "/auth/LandingPage"). They are rendered
 * through the App Router in the real UI, but Next still prerenders the
 * stray routes at build time — wrap them in the same providers so
 * useI18n()/useTheme() never throw there.
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <Component {...pageProps} />
      </I18nProvider>
    </ThemeProvider>
  );
}
