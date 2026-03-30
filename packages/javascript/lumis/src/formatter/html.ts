import type {
  HighlightEvent,
  HighlightStyle,
  HighlightSpan,
  HtmlElement,
  LineSpec,
  LanguageRef,
  Theme,
} from "../types.js";
import { HIGHLIGHT_NAMES } from "../highlights.js";
import { sanitizeThemeName } from "../themes.js";

const _encoder = new TextEncoder();
const _decoder = new TextDecoder();

/** @internal */
export function encodeSource(source: string): Uint8Array {
  return _encoder.encode(source);
}

/** @internal */
export function decodeSourceSlice(
  sourceBytes: Uint8Array,
  startByte: number,
  endByte: number,
): string {
  return _decoder.decode(sourceBytes.subarray(startByte, endByte));
}

/** HTML attribute map. Values of `undefined`, `null`, or `false` are omitted. */
export type HtmlAttrs = Record<string, string | number | boolean | undefined | null>;

function languageId(language: LanguageRef): string {
  return typeof language === "string" ? language : language.id;
}

function emptySpan(scope: string, language: string): HighlightSpan {
  return {
    startByte: 0,
    endByte: 0,
    scope,
    language,
  };
}

function getSpanStyle(
  theme: Theme | undefined,
  scope: string,
  language: string,
): HighlightStyle | undefined {
  if (scope.length === 0) {
    return undefined;
  }

  return getScopedThemeStyle(theme, scope, language);
}

function getUnderlineDecoration(style: HighlightStyle): string | undefined {
  if (style.underline == null || style.underline === false) {
    return undefined;
  }

  if (style.underline === true || style.underline === "solid") {
    return "underline";
  }

  return `underline ${style.underline}`;
}

/**
 * Look up a scope's style in a theme, falling back to parent scopes.
 *
 * ```ts
 * getThemeStyle(dracula, 'string.special.regex')
 * // tries 'string.special.regex', then 'string.special', then 'string'
 * ```
 * @internal
 */
export function getThemeStyle(theme: Theme | undefined, scope: string): HighlightStyle | undefined {
  if (!theme) return undefined;

  let current = scope;
  while (current.length > 0) {
    const style = theme.highlights[current];
    if (style) return style;

    const idx = current.lastIndexOf(".");
    if (idx === -1) {
      break;
    }
    current = current.slice(0, idx);
  }

  return undefined;
}

/**
 * Look up a scope's style, trying a language-specific scope first.
 *
 * ```ts
 * getScopedThemeStyle(dracula, 'string', 'json')
 * // tries 'string.json' first, then falls back to 'string'
 * ```
 * @internal
 */
export function getScopedThemeStyle(
  theme: Theme | undefined,
  scope: string,
  language: LanguageRef,
): HighlightStyle | undefined {
  return getThemeStyle(theme, `${scope}.${languageId(language)}`) ?? getThemeStyle(theme, scope);
}

/**
 * Build a CSS `text-decoration` value from a style.
 *
 * ```ts
 * textDecoration({ underline: 'wavy', strikethrough: true })
 * // "underline wavy line-through"
 * ```
 */
export function textDecoration(style: HighlightStyle): string {
  const underline = getUnderlineDecoration(style);

  if (underline && style.strikethrough) {
    return `${underline} line-through`;
  }
  if (underline) return underline;
  if (style.strikethrough) return "line-through";
  return "none";
}

/**
 * Convert a `HighlightStyle` to inline CSS declarations.
 *
 * ```ts
 * styleToCss({ fg: '#ff79c6', bold: true })
 * // "color: #ff79c6; font-weight: bold;"
 * ```
 */
export function styleToCss(
  style: HighlightStyle | undefined,
  options: { italic?: boolean; separator?: string; compact?: boolean } = {},
): string {
  if (!style) return "";

  const separator = options.separator ?? " ";
  const compact = options.compact ?? false;
  const declaration = (property: string, value: string) =>
    compact ? `${property}:${value};` : `${property}: ${value};`;

  const rules: string[] = [];

  if (style.fg) rules.push(declaration("color", style.fg));
  if (style.bg) rules.push(declaration("background-color", style.bg));
  if (style.bold) rules.push(declaration("font-weight", "bold"));
  if (options.italic && style.italic) rules.push(declaration("font-style", "italic"));

  const decoration = textDecoration(style);
  if (decoration !== "none") {
    rules.push(declaration("text-decoration", decoration));
  }

  return rules.join(separator);
}

/**
 * Escape HTML special characters including braces.
 *
 * ```ts
 * escape('<div class="a">')
 * // "&lt;div class=&quot;a&quot;&gt;"
 * ```
 */
export function escape(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]!;
    switch (ch) {
      case "&":
        result += "&amp;";
        break;
      case "<":
        result += "&lt;";
        break;
      case ">":
        result += "&gt;";
        break;
      case '"':
        result += "&quot;";
        break;
      case "'":
        result += "&#39;";
        break;
      case "{":
        result += "&lbrace;";
        break;
      case "}":
        result += "&rbrace;";
        break;
      default:
        result += ch;
    }
  }
  return result;
}

/**
 * Escape a string for use inside an HTML attribute value.
 *
 * ```ts
 * escapeAttr('font-size: 14px; color: "red"')
 * // "font-size: 14px; color: &quot;red&quot;"
 * ```
 */
export function escapeAttr(value: string): string {
  let result = "";
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i]!;
    switch (ch) {
      case "&":
        result += "&amp;";
        break;
      case "<":
        result += "&lt;";
        break;
      case ">":
        result += "&gt;";
        break;
      case '"':
        result += "&quot;";
        break;
      case "'":
        result += "&#39;";
        break;
      default:
        result += ch;
    }
  }
  return result;
}

/**
 * Join CSS class names, filtering out falsy values.
 *
 * ```ts
 * joinClasses('line', undefined, 'highlighted')  // "line highlighted"
 * joinClasses(undefined, false)                   // undefined
 * ```
 */
export function joinClasses(
  ...classes: Array<string | undefined | false | null>
): string | undefined {
  const value = classes.filter(
    (className): className is string => !!className && className.length > 0,
  );
  return value.length > 0 ? value.join(" ") : undefined;
}

/**
 * Render an `HtmlAttrs` map to an HTML attribute string.
 *
 * ```ts
 * attrsToString({ class: 'foo', style: 'color: red', hidden: true })
 * // 'class="foo" style="color: red" hidden'
 * ```
 */
export function attrsToString(attrs: HtmlAttrs): string {
  const parts: string[] = [];

  for (const [name, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (value === true) {
      parts.push(name);
      continue;
    }

    parts.push(`${name}="${escapeAttr(String(value))}"`);
  }

  return parts.join(" ");
}

/**
 * Build an opening HTML tag with attributes.
 *
 * ```ts
 * openTag('span', { class: 'keyword', style: 'color: red' })
 * // '<span class="keyword" style="color: red">'
 * ```
 */
export function openTag(name: string, attrs: HtmlAttrs = {}): string {
  const renderedAttrs = attrsToString(attrs);
  return renderedAttrs.length > 0 ? `<${name} ${renderedAttrs}>` : `<${name}>`;
}

/**
 * Build a closing HTML tag.
 *
 * ```ts
 * closeTag('span')  // "</span>"
 * ```
 */
export function closeTag(name: string): string {
  return `</${name}>`;
}

/**
 * Open a `<span>` tag with the given attributes.
 *
 * ```ts
 * openSpanTag({ class: 'keyword' })  // '<span class="keyword">'
 * ```
 */
export function openSpanTag(attrs: HtmlAttrs = {}): string {
  const renderedAttrs = attrsToString(attrs);
  return renderedAttrs.length > 0 ? `<span ${renderedAttrs}>` : `<span >`;
}

/**
 * Options for {@link openPreTag}.
 *
 * ```ts
 * openPreTag({ preClass: 'my-code', theme: dracula })
 * ```
 */
export interface OpenPreTagOptions {
  preClass?: string;
  theme?: Theme;
}

/**
 * Open a `<pre>` tag with the `lumis` class and optional theme background.
 *
 * ```ts
 * openPreTag({ theme: dracula })
 * // '<pre class="lumis" style="color: #f8f8f2; background-color: #282a36;">'
 * ```
 */
export function openPreTag(options: OpenPreTagOptions = {}): string {
  const className = options.preClass ? `lumis ${options.preClass}` : "lumis";
  const style = styleToCss(getThemeStyle(options.theme, "normal"));
  return openTag("pre", {
    class: className,
    style: style.length > 0 ? style : undefined,
  });
}

/**
 * Open a `<code>` tag with the language class.
 *
 * ```ts
 * openCodeTag(javascript)  // '<code class="language-javascript" translate="no" tabindex="0">'
 * ```
 */
export function openCodeTag(language: LanguageRef | undefined): string {
  const id = language ? languageId(language) : "plaintext";
  return openTag("code", {
    class: `language-${id}`,
    translate: "no",
    tabindex: 0,
  });
}

/**
 * Close a `<pre>` tag.
 *
 * ```ts
 * closePreTag()  // "</pre>"
 * ```
 */
export function closePreTag(): string {
  return closeTag("pre");
}

/**
 * Close a `<code>` tag.
 *
 * ```ts
 * closeCodeTag()  // "</code>"
 * ```
 */
export function closeCodeTag(): string {
  return closeTag("code");
}

/**
 * Close both `</code>` and `</pre>` tags.
 *
 * ```ts
 * closingTags()  // "</code></pre>"
 * ```
 */
export function closingTags(): string {
  return `${closeCodeTag()}${closePreTag()}`;
}

/**
 * Wrap content with an optional header element.
 *
 * ```ts
 * wrapWithHeader('<pre>...</pre>', { openTag: '<div>', closeTag: '</div>' })
 * // "<div><pre>...</pre></div>"
 * ```
 * @internal
 */
export function wrapWithHeader(content: string, header?: HtmlElement): string {
  if (!header) return content;
  return `${header.openTag}${content}${header.closeTag}`;
}

/**
 * Escape curly braces to HTML entities.
 *
 * ```ts
 * escapeBraces('{foo}')  // "&lbrace;foo&rbrace;"
 * ```
 */
export function escapeBraces(text: string): string {
  return text.replaceAll("{", "&lbrace;").replaceAll("}", "&rbrace;");
}

export function escapeFragment(text: string): string {
  return escape(text);
}

/**
 * Convert a dot-separated scope to a CSS class name.
 *
 * ```ts
 * scopeToClass('string.special.regex')  // "string-special-regex"
 * ```
 */
export function scopeToClass(scope: string): string {
  return HIGHLIGHT_NAMES.includes(scope) ? scope.replaceAll(".", "-") : "text";
}

/**
 * Options for {@link spanInline} and {@link spanInlineAttrs}.
 *
 * ```ts
 * spanInline('const', { language: 'javascript', scope: 'keyword', theme: dracula })
 * ```
 */
export interface SpanInlineOptions {
  language: LanguageRef;
  scope: string;
  theme?: Theme;
  italic?: boolean;
  includeHighlights?: boolean;
}

/**
 * Build HTML attributes for an inline-styled `<span>`.
 *
 * ```ts
 * spanInlineAttrs({ language: 'javascript', scope: 'keyword', theme: dracula })
 * // { style: "color: #ff79c6;" }
 * ```
 */
export function spanInlineAttrs(options: SpanInlineOptions): HtmlAttrs {
  const attrs: HtmlAttrs = {};

  if (options.includeHighlights) {
    attrs["data-highlight"] = options.scope;
  }

  const css = styleToCss(getScopedThemeStyle(options.theme, options.scope, options.language), {
    italic: options.italic,
  });
  if (css) {
    attrs.style = css;
  }

  return attrs;
}

/**
 * Render an inline-styled `<span>` for a token.
 *
 * ```ts
 * spanInline('const', { language: 'javascript', scope: 'keyword', theme: dracula })
 * // '<span style="color: #ff79c6;">const</span>'
 * ```
 */
export function spanInline(text: string, options: SpanInlineOptions): string {
  const escaped = escape(text);
  const attrs = spanInlineAttrs(options);
  const rendered = attrsToString(attrs);
  return rendered.length > 0 ? `<span ${rendered}>${escaped}</span>` : escaped;
}

/**
 * Build HTML attributes for a class-based `<span>`.
 *
 * ```ts
 * spanLinkedAttrs('keyword')  // 'class="keyword"'
 * ```
 */
export function spanLinkedAttrs(scope: string): string {
  return `class="${scopeToClass(scope)}"`;
}

/**
 * Render a class-based `<span>` for a token.
 *
 * ```ts
 * spanLinked('const', 'keyword')  // '<span class="keyword">const</span>'
 * ```
 */
export function spanLinked(text: string, scope: string): string {
  const escaped = escape(text);
  const cls = scopeToClass(scope);
  return `<span class="${cls}">${escaped}</span>`;
}

/**
 * Options for {@link spanMultiThemes} and {@link spanMultiThemesAttrs}.
 *
 * ```ts
 * spanMultiThemes('const', {
 *   language: 'javascript',
 *   scope: 'keyword',
 *   themes: { light: githubLight, dark: githubDark },
 *   defaultTheme: 'light-dark()',
 * })
 * ```
 */
export interface SpanMultiThemesOptions {
  language: LanguageRef;
  scope: string;
  themes: Record<string, Theme | undefined>;
  defaultTheme?: string;
  /** Defaults to `"--lumis"`. */
  cssVariablePrefix?: string;
  italic?: boolean;
  includeHighlights?: boolean;
}

/**
 * Build HTML attributes for a multi-theme `<span>` with CSS custom properties.
 *
 * ```ts
 * spanMultiThemesAttrs({ language: 'js', scope: 'keyword', themes: { light: l, dark: d } })
 * // { style: "--lumis-light:#000; --lumis-dark:#fff; ..." }
 * ```
 */
export function spanMultiThemesAttrs(options: SpanMultiThemesOptions): HtmlAttrs {
  const { scope, language, themes, italic, includeHighlights } = options;
  const defaultTheme = options.defaultTheme;
  const cssVariablePrefix = options.cssVariablePrefix ?? "--lumis";

  if (Object.keys(themes).length === 0) {
    return {};
  }

  const attrs: HtmlAttrs = {};
  if (includeHighlights) {
    attrs["data-highlight"] = scope;
  }

  const inlineStyles: string[] = [];
  const cssVars: string[] = [];

  if (defaultTheme === "light-dark()") {
    const lightStyle = getScopedThemeStyle(themes.light, scope, language);
    const darkStyle = getScopedThemeStyle(themes.dark, scope, language);

    if (lightStyle && darkStyle) {
      appendLightDarkStyles(inlineStyles, lightStyle, darkStyle, italic);
    }
  } else if (defaultTheme) {
    applyDefaultMultiTheme(inlineStyles, cssVars, options);
    appendThemeCssVars(cssVars, cssVariablePrefix, themes, scope, language, defaultTheme);
  } else {
    appendThemeCssVars(cssVars, cssVariablePrefix, themes, scope, language);
  }

  const styleParts = [...inlineStyles, ...cssVars].filter(Boolean);
  if (styleParts.length > 0) {
    attrs.style = styleParts.join(" ");
  }

  return attrs;
}

function appendDefaultThemeCssVars(
  cssVars: string[],
  prefix: string,
  themeName: string,
  style: HighlightStyle,
): void {
  const sanitized = sanitizeThemeName(themeName);
  cssVars.push(`${prefix}-${sanitized}-font-style:${style.italic ? "italic" : "normal"};`);
  cssVars.push(`${prefix}-${sanitized}-font-weight:${style.bold ? "bold" : "normal"};`);
  cssVars.push(`${prefix}-${sanitized}-text-decoration:${textDecoration(style)};`);
}

function appendLightDarkStyles(
  inlineStyles: string[],
  lightStyle: HighlightStyle,
  darkStyle: HighlightStyle,
  italic?: boolean,
): void {
  if (lightStyle.fg && darkStyle.fg) {
    inlineStyles.push(`color: light-dark(${lightStyle.fg}, ${darkStyle.fg});`);
  }
  if (lightStyle.bg && darkStyle.bg) {
    inlineStyles.push(`background-color: light-dark(${lightStyle.bg}, ${darkStyle.bg});`);
  }

  inlineStyles.push(
    `font-weight: light-dark(${lightStyle.bold ? "bold" : "normal"}, ${darkStyle.bold ? "bold" : "normal"});`,
  );

  if (italic) {
    inlineStyles.push(
      `font-style: light-dark(${lightStyle.italic ? "italic" : "normal"}, ${darkStyle.italic ? "italic" : "normal"});`,
    );
  }

  const lightDecoration = textDecoration(lightStyle) ?? "none";
  const darkDecoration = textDecoration(darkStyle);
  inlineStyles.push(`text-decoration: light-dark(${lightDecoration}, ${darkDecoration});`);
}

function applyDefaultMultiTheme(
  inlineStyles: string[],
  cssVars: string[],
  options: SpanMultiThemesOptions,
): void {
  const { defaultTheme, themes, scope, language, italic, cssVariablePrefix = "--lumis" } = options;
  if (!defaultTheme || defaultTheme === "light-dark()") {
    return;
  }

  const defaultStyle = getScopedThemeStyle(themes[defaultTheme], scope, language);
  if (!defaultStyle) {
    return;
  }

  const css = styleToCss(defaultStyle, { italic, compact: true });
  if (css) {
    inlineStyles.push(css);
  }

  appendDefaultThemeCssVars(cssVars, cssVariablePrefix, defaultTheme, defaultStyle);
}

/**
 * Render a multi-theme `<span>` with CSS custom properties.
 *
 * ```ts
 * spanMultiThemes('const', {
 *   language: 'javascript',
 *   scope: 'keyword',
 *   themes: { light: githubLight, dark: githubDark },
 *   defaultTheme: 'light-dark()',
 * })
 * ```
 */
export function spanMultiThemes(text: string, options: SpanMultiThemesOptions): string {
  const escaped = escape(text);

  if (Object.keys(options.themes).length === 0) {
    return escaped;
  }

  const attrs = spanMultiThemesAttrs(options);
  const rendered = attrsToString(attrs);
  return rendered.length > 0 ? `<span ${rendered}>${escaped}</span>` : escaped;
}

function pushThemeCssVars(
  cssVars: string[],
  prefix: string,
  themeName: string,
  scope: string,
  language: LanguageRef,
  theme: Theme | undefined,
): void {
  const style = getScopedThemeStyle(theme, scope, language);
  if (!style) return;

  const sanitized = sanitizeThemeName(themeName);
  if (style.fg) cssVars.push(`${prefix}-${sanitized}:${style.fg};`);
  if (style.bg) cssVars.push(`${prefix}-${sanitized}-bg:${style.bg};`);
  cssVars.push(`${prefix}-${sanitized}-font-style:${style.italic ? "italic" : "normal"};`);
  cssVars.push(`${prefix}-${sanitized}-font-weight:${style.bold ? "bold" : "normal"};`);
  cssVars.push(`${prefix}-${sanitized}-text-decoration:${textDecoration(style)};`);
}

export function appendThemeCssVars(
  cssVars: string[],
  prefix: string,
  themes: Record<string, Theme | undefined>,
  scope: string,
  language: LanguageRef,
  excludeTheme?: string,
): void {
  for (const [themeName, theme] of Object.entries(themes)) {
    if (themeName === excludeTheme) {
      continue;
    }

    pushThemeCssVars(cssVars, prefix, themeName, scope, language, theme);
  }
}

export function buildNormalThemeVars(
  styles: string[],
  prefix: string,
  themes: Record<string, Theme>,
  excludeTheme?: string,
): void {
  for (const [themeName, theme] of Object.entries(themes)) {
    if (themeName === excludeTheme) {
      continue;
    }

    const sanitized = sanitizeThemeName(themeName);
    const style = getThemeStyle(theme, "normal");
    if (style?.fg) styles.push(`${prefix}-${sanitized}:${style.fg};`);
    if (style?.bg) styles.push(`${prefix}-${sanitized}-bg:${style.bg};`);
  }
}

export function buildPreThemeStyle(options: {
  themes: Record<string, Theme>;
  defaultTheme?: string;
  cssVariablePrefix?: string;
}): string | undefined {
  const prefix = options.cssVariablePrefix ?? "--lumis";
  const styles: string[] = [];

  if (options.defaultTheme === "light-dark()") {
    const lightNormal = getThemeStyle(options.themes.light, "normal");
    const darkNormal = getThemeStyle(options.themes.dark, "normal");
    const lightFg = lightNormal?.fg ?? "#000000";
    const lightBg = lightNormal?.bg ?? "#ffffff";
    const darkFg = darkNormal?.fg ?? "#ffffff";
    const darkBg = darkNormal?.bg ?? "#000000";

    styles.push(`color: light-dark(${lightFg}, ${darkFg});`);
    styles.push(`background-color: light-dark(${lightBg}, ${darkBg});`);
  } else if (options.defaultTheme) {
    const defaultStyle = getThemeStyle(options.themes[options.defaultTheme], "normal");
    if (defaultStyle?.fg) styles.push(`color:${defaultStyle.fg};`);
    if (defaultStyle?.bg) styles.push(`background-color:${defaultStyle.bg};`);
    buildNormalThemeVars(styles, prefix, options.themes, options.defaultTheme);
  } else {
    buildNormalThemeVars(styles, prefix, options.themes);
  }

  return styles.length > 0 ? styles.join(" ") : undefined;
}

export function renderHtmlBlock(options: {
  lines: string[];
  language: LanguageRef | undefined;
  pre: string;
  lineOptions: (lineNumber: number) => { className?: string; style?: string };
  header?: HtmlElement;
}): string {
  const code = openCodeTag(options.language);
  const body = options.lines
    .map((line, idx) => wrapLine(idx + 1, line, options.lineOptions(idx + 1)))
    .join("");

  return wrapWithHeader(`${options.pre}${code}${body}${closingTags()}`, options.header);
}

/**
 * Wrap a line of highlighted HTML in a `<div>` with line metadata.
 *
 * ```ts
 * wrapLine(1, '<span>const</span>', { className: 'highlighted' })
 * // '<div class="line highlighted" data-line="1"><span>const</span>\n</div>'
 * ```
 */
export function wrapLine(
  lineNumber: number,
  content: string,
  options: { className?: string; style?: string } = {},
): string {
  return `${openTag("div", {
    class: joinClasses("line", options.className),
    style: options.style,
    "data-line": lineNumber,
  })}${content}\n${closeTag("div")}`;
}

/**
 * Check if a line number is in a list of highlighted lines.
 *
 * ```ts
 * lineIsHighlighted([1, [3, 5]], 4)  // true
 * lineIsHighlighted([1, [3, 5]], 2)  // false
 * ```
 */
export function lineIsHighlighted(lines: LineSpec[] | undefined, lineNumber: number): boolean {
  if (!lines) return false;

  return lines.some((line) =>
    typeof line === "number" ? line === lineNumber : lineNumber >= line[0] && lineNumber <= line[1],
  );
}

/**
 * Get the CSS class for a highlighted line, or `undefined` if not highlighted.
 *
 * ```ts
 * getHighlightLineClass([1, [3, 5]], 4, 'active')  // "active"
 * getHighlightLineClass([1, [3, 5]], 2, 'active')  // undefined
 * ```
 */
export function getHighlightLineClass(
  lines: LineSpec[] | undefined,
  lineNumber: number,
  className: string | undefined,
  defaultClass?: string,
): string | undefined {
  if (!lineIsHighlighted(lines, lineNumber)) {
    return undefined;
  }

  return className ?? defaultClass;
}

/**
 * Append a text fragment to the last line, splitting on newlines.
 *
 * ```ts
 * const lines = ['hello']
 * appendFragment(lines, ' world\nnew line')
 * // lines → ['hello world', 'new line']
 * ```
 * @internal
 */
export function appendFragment(lines: string[], fragment: string): void {
  if (!fragment.includes("\n")) {
    lines[lines.length - 1] += fragment;
    return;
  }

  const parts = fragment.split("\n");

  for (let i = 0; i < parts.length; i += 1) {
    lines[lines.length - 1] += parts[i] ?? "";
    if (i < parts.length - 1) {
      lines.push("");
    }
  }
}

function closeOpenSpans(
  lines: string[],
  stack: Array<{ scope: string; language: string }>,
  closeSpan: (span: HighlightSpan, style: HighlightStyle | undefined) => string,
  theme: Theme | undefined,
): void {
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const entry = stack[i]!;
    const style = getSpanStyle(theme, entry.scope, entry.language);
    appendFragment(lines, closeSpan(emptySpan(entry.scope, entry.language), style));
  }
}

function reopenSpans(
  lines: string[],
  stack: Array<{ scope: string; language: string }>,
  openSpan: (span: HighlightSpan, style: HighlightStyle | undefined) => string,
  theme: Theme | undefined,
): void {
  for (const entry of stack) {
    const style = getSpanStyle(theme, entry.scope, entry.language);
    appendFragment(lines, openSpan(emptySpan(entry.scope, entry.language), style));
  }
}

function renderSourceEvent(
  lines: string[],
  text: string,
  stack: Array<{ scope: string; language: string }>,
  formatText: (text: string) => string,
  openSpan: (span: HighlightSpan, style: HighlightStyle | undefined) => string,
  closeSpan: (span: HighlightSpan, style: HighlightStyle | undefined) => string,
  theme: Theme | undefined,
): void {
  let remaining = text;

  while (true) {
    const newlineIndex = remaining.indexOf("\n");
    if (newlineIndex === -1) {
      appendFragment(lines, formatText(remaining));
      return;
    }

    appendFragment(lines, formatText(remaining.slice(0, newlineIndex)));
    closeOpenSpans(lines, stack, closeSpan, theme);
    lines.push("");
    reopenSpans(lines, stack, openSpan, theme);
    remaining = remaining.slice(newlineIndex + 1);
  }
}

/** @internal */
export function formatHighlightIterLines(
  source: string,
  events: HighlightEvent[],
  languageRef: LanguageRef | undefined,
  theme: Theme | undefined,
  options: {
    formatText?: (text: string) => string;
    openSpan: (span: HighlightSpan, style: HighlightStyle | undefined) => string;
    closeSpan?: (span: HighlightSpan, style: HighlightStyle | undefined) => string;
  },
): { lines: string[]; language: string } {
  const formatText = options.formatText ?? escape;
  const closeSpan = options.closeSpan ?? (() => closeTag("span"));
  const sourceBytes = encodeSource(source);
  const lines = [""];
  let language = languageRef ? languageId(languageRef) : "plaintext";
  const stack: Array<{ scope: string; language: string }> = [];

  for (const event of events) {
    if (event.type === "start") {
      const style = getSpanStyle(theme, event.scope, event.language);
      const span = emptySpan(event.scope, event.language);
      appendFragment(lines, options.openSpan(span, style));
      stack.push({ scope: event.scope, language: event.language });
      continue;
    }

    if (event.type === "end") {
      const top = stack.pop();
      if (top) {
        const style = getSpanStyle(theme, top.scope, top.language);
        const span = emptySpan(top.scope, top.language);
        appendFragment(lines, closeSpan(span, style));
      }
      continue;
    }

    // source event
    if (!language || language === "plaintext") {
      const top = stack[stack.length - 1];
      if (top) language = top.language;
    }

    const text = decodeSourceSlice(sourceBytes, event.startByte, event.endByte);

    renderSourceEvent(lines, text, stack, formatText, options.openSpan, closeSpan, theme);
  }

  while (stack.pop()) {
    appendFragment(lines, closeSpan(emptySpan("", ""), undefined));
  }

  return { lines, language };
}

/**
 * Render highlight events into escaped HTML lines, reopening active spans across newlines.
 *
 * ```ts
 * renderLinesFromEvents('a\nb', events, (scope) => `class="${scope}"`)
 * // ['<span class="...">a</span>', '<span class="...">b</span>']
 * ```
 */
export function renderLinesFromEvents(
  source: string,
  events: HighlightEvent[],
  spanAttrs: (scope: string, language: string) => string,
): string[] {
  return formatHighlightIterLines(source, events, undefined, undefined, {
    openSpan: (span) => {
      const attrs = spanAttrs(span.scope, span.language);
      return attrs.length > 0 ? `<span ${attrs}>` : "<span >";
    },
  }).lines;
}

/**
 * Render highlight events into a single HTML buffer plus line offsets.
 *
 * The returned offsets can be passed to {@link linesFromOffsets}.
 */
export function renderEvents(
  source: string,
  events: HighlightEvent[],
  attributeCallback: (scope: string, language: string, html: string[]) => void,
): [Uint8Array, number[]] {
  const sourceBytes = encodeSource(source);
  const html: string[] = [];
  const lineOffsets = [0];
  let renderedLength = 0;

  const push = (fragment: string): void => {
    html.push(fragment);
    renderedLength += fragment.length;
  };

  for (const event of events) {
    if (event.type === "start") {
      push("<span ");
      attributeCallback(event.scope, event.language, html);
      renderedLength = html.join("").length;
      push(">");
      continue;
    }

    if (event.type === "end") {
      push("</span>");
      continue;
    }

    const text = decodeSourceSlice(sourceBytes, event.startByte, event.endByte);
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i]!;
      if (char === "\n") {
        push("\n");
        lineOffsets.push(renderedLength);
        continue;
      }

      switch (char) {
        case "&":
          push("&amp;");
          break;
        case "<":
          push("&lt;");
          break;
        case ">":
          push("&gt;");
          break;
        case '"':
          push("&quot;");
          break;
        case "'":
          push("&#39;");
          break;
        default:
          push(char);
      }
    }
  }

  return [encodeSource(html.join("")), lineOffsets];
}

/**
 * Slice rendered HTML back into lines using offsets from {@link renderEvents}.
 */
export function linesFromOffsets(html: Uint8Array, lineOffsets: number[]): string[] {
  const rendered = _decoder.decode(html);
  const lines: string[] = [];

  for (let i = 0; i < lineOffsets.length; i += 1) {
    const start = lineOffsets[i] ?? 0;
    const end = lineOffsets[i + 1] ?? rendered.length;
    lines.push(rendered.slice(start, end));
  }

  return lines;
}
