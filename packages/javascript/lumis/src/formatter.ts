import type {
  BBCodeScopedFormatter,
  BBCodeScopedOptions,
  Formatter,
  HtmlInlineOptions,
  HtmlInlineFormatter,
  HtmlLinkedOptions,
  HtmlLinkedFormatter,
  HtmlMultiThemesOptions,
  HtmlMultiThemesFormatter,
  TerminalOptions,
  TerminalFormatter,
} from "./types.js";
import { highlightEvents } from "./core/highlighter.js";
import { formatBBCode } from "./formatter/bbcode.js";
import { formatHtmlInline } from "./formatter/html-inline.js";
import { formatHtmlLinked } from "./formatter/html-linked.js";
import { formatHtmlMultiThemes } from "./formatter/html-multi-themes.js";

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
    format(source: string): string {
      return formatHtmlInline(source, highlightEvents(source, formatter.language), formatter);
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
    format(source: string): string {
      return formatHtmlLinked(source, highlightEvents(source, formatter.language), formatter);
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
    format(source: string): string {
      return formatHtmlMultiThemes(source, highlightEvents(source, formatter.language), formatter);
    },
  };
  return formatter;
}

/**
 * Create a BBCode scoped formatter using highlight scope names as nested tags.
 * It does not emit standard forum-style BBCode like `[b]`, `[color]`, or `[code]`.
 *
 * @example
 * ```ts
 * import { bbcodeScoped } from '@lumis-sh/lumis/formatters'
 * import javascript from '@lumis-sh/lumis/langs/javascript'
 *
 * const output = hl.highlight('const x = 1', bbcodeScoped({ language: javascript }))
 * console.log(output)
 * ```
 */
export function bbcodeScoped(options: BBCodeScopedOptions = {}): BBCodeScopedFormatter {
  const formatter: BBCodeScopedFormatter = {
    ...options,
    format(source: string): string {
      return formatBBCode(source, highlightEvents(source, formatter.language));
    },
  };
  return formatter;
}

export type {
  BBCodeScopedFormatter,
  BBCodeScopedOptions,
  Formatter,
  HighlightCallback,
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
