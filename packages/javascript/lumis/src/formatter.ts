import type {
  Formatter,
  HighlightContext,
  HtmlInlineOptions,
  HtmlInlineFormatter,
  HtmlLinkedOptions,
  HtmlLinkedFormatter,
  HtmlMultiThemesOptions,
  HtmlMultiThemesFormatter,
  TerminalOptions,
  TerminalFormatter,
} from "./types.js";
import { formatHtmlInline } from "./formatter/html-inline.js";
import { formatHtmlLinked } from "./formatter/html-linked.js";
import { formatHtmlMultiThemes } from "./formatter/html-multi-themes.js";
import { formatTerminal } from "./formatter/terminal.js";

/**
 * Create an inline-styles HTML formatter. Each token gets a `<span>` with
 * `style="color: ..."` pulled from the theme.
 *
 * @example
 * ```ts
 * import { htmlInline } from '@lumis-sh/lumis/formatters'
 * import javascript from '@lumis-sh/lumis/langs/javascript'
 * import dracula from '@lumis-sh/themes/dracula'
 *
 * hl.highlight('const x = 1', htmlInline({ language: javascript, theme: dracula }))
 * ```
 */
export function htmlInline(options: HtmlInlineOptions = {}): HtmlInlineFormatter {
  const formatter: HtmlInlineFormatter = {
    ...options,
    format(source: string, hl: HighlightContext): string {
      const events = hl.highlightEvents(source, options.language);
      return formatHtmlInline(source, events, formatter);
    },
  };

  return formatter;
}

/**
 * Create a class-based HTML formatter. Each token gets a `<span class="...">` with
 * semantic scope names. Requires a theme CSS file on the page.
 *
 * @example
 * ```ts
 * import { htmlLinked } from '@lumis-sh/lumis/formatters'
 * import javascript from '@lumis-sh/lumis/langs/javascript'
 * import '@lumis-sh/themes/css/dracula.css'
 *
 * hl.highlight('const x = 1', htmlLinked({ language: javascript }))
 * ```
 */
export function htmlLinked(options: HtmlLinkedOptions = {}): HtmlLinkedFormatter {
  const formatter: HtmlLinkedFormatter = {
    ...options,
    format(source: string, hl: HighlightContext): string {
      const events = hl.highlightEvents(source, options.language);
      return formatHtmlLinked(source, events, formatter);
    },
  };

  return formatter;
}

/**
 * Create a multi-theme HTML formatter using CSS custom properties.
 * Light/dark switching works via `prefers-color-scheme`.
 *
 * @example
 * ```ts
 * import { htmlMultiThemes } from '@lumis-sh/lumis/formatters'
 * import javascript from '@lumis-sh/lumis/langs/javascript'
 * import githubLight from '@lumis-sh/themes/github_light'
 * import githubDark from '@lumis-sh/themes/github_dark'
 *
 * hl.highlight('const x = 1', htmlMultiThemes({
 *   language: javascript,
 *   themes: { light: githubLight, dark: githubDark },
 *   defaultTheme: 'light-dark()',
 * }))
 * ```
 */
export function htmlMultiThemes(options: HtmlMultiThemesOptions): HtmlMultiThemesFormatter {
  const formatter: HtmlMultiThemesFormatter = {
    ...options,
    format(source: string, hl: HighlightContext): string {
      const events = hl.highlightEvents(source, options.language);
      return formatHtmlMultiThemes(source, events, formatter);
    },
  };

  return formatter;
}

/**
 * Create a terminal formatter that outputs ANSI escape codes.
 *
 * @example
 * ```ts
 * import { terminal } from '@lumis-sh/lumis/formatters'
 * import javascript from '@lumis-sh/lumis/langs/javascript'
 * import dracula from '@lumis-sh/themes/dracula'
 *
 * const ansi = hl.highlight('const x = 1', terminal({ language: javascript, theme: dracula }))
 * console.log(ansi)
 * ```
 */
export function terminal(options: TerminalOptions = {}): TerminalFormatter {
  const formatter: TerminalFormatter = {
    ...options,
    format(source: string, hl: HighlightContext): string {
      const events = hl.highlightEvents(source, options.language);
      return formatTerminal(source, events, formatter);
    },
  };

  return formatter;
}

export type {
  Formatter,
  HighlightCallback,
  HighlightContext,
  HighlightEvent,
  HighlightIterFn,
  HighlightRange,
  HighlightSpan,
  HighlightStyle,
  HtmlInlineFormatter,
  HtmlInlineOptions,
  HtmlLinkedFormatter,
  HtmlLinkedOptions,
  HtmlMultiThemesFormatter,
  HtmlMultiThemesOptions,
  TerminalFormatter,
  TerminalOptions,
} from "./types.js";
