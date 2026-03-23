import type {
  HighlightEvent,
  HighlightStyle,
  HighlightSpan,
  HtmlElement,
  LineSpec,
  LanguageRef,
  Theme,
} from "../types.js";
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
export function textDecoration(style: HighlightStyle): string | undefined {
  const underline =
    style.underline === true
      ? "underline"
      : style.underline === false || style.underline == null
        ? undefined
        : style.underline === "solid"
          ? "underline"
          : `underline ${style.underline}`;

  if (underline && style.strikethrough) {
    return `${underline} line-through`;
  }
  if (underline) return underline;
  if (style.strikethrough) return "line-through";
  return undefined;
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
  if (decoration) {
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
  return openTag("span", attrs);
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

/**
 * Convert a dot-separated scope to a CSS class name.
 *
 * ```ts
 * scopeToClass('string.special.regex')  // "string-special-regex"
 * ```
 */
export function scopeToClass(scope: string): string {
  return scope.replaceAll(".", "-");
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
      const darkDecoration = textDecoration(darkStyle) ?? "none";
      inlineStyles.push(`text-decoration: light-dark(${lightDecoration}, ${darkDecoration});`);
    }
  } else if (defaultTheme) {
    const defaultStyle = getScopedThemeStyle(themes[defaultTheme], scope, language);
    if (defaultStyle) {
      const css = styleToCss(defaultStyle, { italic, compact: true });
      if (css) {
        inlineStyles.push(css);
      }

      const sanitized = sanitizeThemeName(defaultTheme);
      cssVars.push(
        `${cssVariablePrefix}-${sanitized}-font-style:${defaultStyle.italic ? "italic" : "normal"};`,
      );
      cssVars.push(
        `${cssVariablePrefix}-${sanitized}-font-weight:${defaultStyle.bold ? "bold" : "normal"};`,
      );
      cssVars.push(
        `${cssVariablePrefix}-${sanitized}-text-decoration:${textDecoration(defaultStyle) ?? "none"};`,
      );
    }

    for (const [themeName, theme] of Object.entries(themes)) {
      if (themeName === defaultTheme) continue;
      pushThemeCssVars(cssVars, cssVariablePrefix, themeName, scope, language, theme);
    }
  } else {
    for (const [themeName, theme] of Object.entries(themes)) {
      pushThemeCssVars(cssVars, cssVariablePrefix, themeName, scope, language, theme);
    }
  }

  const styleParts = [...inlineStyles, ...cssVars].filter(Boolean);
  if (styleParts.length > 0) {
    attrs.style = styleParts.join(" ");
  }

  return attrs;
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
  cssVars.push(`${prefix}-${sanitized}-text-decoration:${textDecoration(style) ?? "none"};`);
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
      const style =
        event.scope.length > 0
          ? getScopedThemeStyle(theme, event.scope, event.language)
          : undefined;
      const span: HighlightSpan = {
        startByte: 0,
        endByte: 0,
        scope: event.scope,
        language: event.language,
      };
      appendFragment(lines, options.openSpan(span, style));
      stack.push({ scope: event.scope, language: event.language });
      continue;
    }

    if (event.type === "end") {
      const top = stack.pop();
      if (top) {
        const style =
          top.scope.length > 0 ? getScopedThemeStyle(theme, top.scope, top.language) : undefined;
        const span: HighlightSpan = {
          startByte: 0,
          endByte: 0,
          scope: top.scope,
          language: top.language,
        };
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

    // Handle newlines: close all open spans, start new line, reopen spans
    const parts = text.split("\n");
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i] ?? "";
      if (part.length > 0) {
        appendFragment(lines, formatText(part));
      }
      if (i < parts.length - 1) {
        // Close all open spans for this line
        for (let j = stack.length - 1; j >= 0; j--) {
          const entry = stack[j]!;
          const entryStyle =
            entry.scope.length > 0
              ? getScopedThemeStyle(theme, entry.scope, entry.language)
              : undefined;
          appendFragment(
            lines,
            closeSpan(
              { startByte: 0, endByte: 0, scope: entry.scope, language: entry.language },
              entryStyle,
            ),
          );
        }
        lines.push("");
        // Reopen all spans on new line
        for (const entry of stack) {
          const entryStyle =
            entry.scope.length > 0
              ? getScopedThemeStyle(theme, entry.scope, entry.language)
              : undefined;
          appendFragment(
            lines,
            options.openSpan(
              { startByte: 0, endByte: 0, scope: entry.scope, language: entry.language },
              entryStyle,
            ),
          );
        }
      }
    }
  }

  // Close any remaining open spans
  while (stack.pop()) {
    appendFragment(
      lines,
      closeSpan({ startByte: 0, endByte: 0, scope: "", language: "" }, undefined),
    );
  }

  return { lines, language };
}
