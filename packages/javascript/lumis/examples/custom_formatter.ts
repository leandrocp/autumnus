import { createHighlighter } from "../src/index.ts";
import { type Formatter } from "../src/formatters.ts";
import {
  closeTag,
  closingTags,
  formatHighlightIterLines,
  openCodeTag,
  openPreTag,
  openSpanTag,
  styleToCss,
  wrapLine,
} from "../src/formatter/html.ts";
import html from "../langs/html.ts";
import javascript from "../langs/javascript.ts";
import dracula from "@lumis-sh/themes/dracula";

class InteractiveDocsFormatter implements Formatter {
  constructor(readonly language = html) {}

  format(_source: string, highlightIter: Parameters<Formatter["format"]>[1]): string {
    let tokenId = 0;

    const { lines, language } = formatHighlightIterLines(highlightIter, this.language, dracula, {
      openSpan: (span, style) =>
        openSpanTag({
          class: "tok",
          tabindex: 0,
          "data-token-id": String(++tokenId),
          "data-scope": span.scope,
          "data-language": span.language,
          "data-start": String(span.startByte),
          "data-end": String(span.endByte),
          "data-fg": style?.fg,
          "data-bg": style?.bg,
          style: styleToCss(style, { italic: true }),
        }),
    });

    const body = lines.map((line, index) => wrapLine(index + 1, line)).join("");
    return `${openPreTag({ preClass: "docs-demo" })}${openCodeTag(this.language)}${body}${closingTags()}`;
  }
}

const code = `<article class="profile-card">
  <h2>User profile</h2>
  <script>
    async function loadUserProfile(userId) {
      const response = await fetch(\`/api/users/\${userId}\`)
      if (!response.ok) throw new Error('Failed to load user profile')

      return response.json()
    }
  </script>
</article>`;

const hl = await createHighlighter({ languages: [html, javascript] });

console.log(hl.highlight(code, new InteractiveDocsFormatter()));
