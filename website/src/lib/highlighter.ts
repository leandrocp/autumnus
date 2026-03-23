import { createHighlighter } from "@lumis-sh/lumis";
import { bundledLanguages } from "@lumis-sh/lumis/bundles/full";
import { htmlInline, htmlMultiThemes } from "@lumis-sh/lumis/formatters";
import type { Highlighter, Theme } from "@lumis-sh/lumis";
import type { LanguageOption } from "../data/languages";
import { LANGUAGES } from "../data/languages";

const highlighterPromise = createHighlighter({
  langs: [bundledLanguages],
});

/** Preload all language WASMs in the background so switching is instant. */
export async function preloadAllLanguages(): Promise<void> {
  const highlighter = await highlighterPromise;
  await Promise.all(LANGUAGES.map((l) => highlighter.loadLanguage(l.language).catch(() => {})));
}

export async function renderHighlight(language: LanguageOption, theme: Theme, source: string, preClass?: string) {
  const highlighter = await highlighterPromise;
  await highlighter.loadLanguage(language.language);
  return highlighter.highlight(
    source,
    htmlInline({
      language: language.language,
      theme,
      preClass:
        preClass ??
        "m-0 overflow-x-auto p-5 font-mono text-[13px] leading-relaxed sm:p-6 sm:text-sm",
      includeHighlights: true,
      italic: false,
    }),
  );
}

export async function renderHighlightMultiTheme(
  language: LanguageOption,
  lightTheme: Theme,
  darkTheme: Theme,
  source: string,
  preClass?: string,
) {
  const highlighter = await highlighterPromise;
  await highlighter.loadLanguage(language.language);
  return highlighter.highlight(
    source,
    htmlMultiThemes({
      language: language.language,
      themes: { light: lightTheme, dark: darkTheme },
      defaultTheme: "light-dark()",
      preClass:
        preClass ??
        "m-0 overflow-x-auto p-5 font-mono text-[13px] leading-relaxed sm:p-6 sm:text-sm",
      italic: false,
    }),
  );
}
