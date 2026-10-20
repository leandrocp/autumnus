import { diffWordClass, type DiffWordKind } from "../diff-word-style.js";
import type {
  BudgetExhausted,
  HighlightEvent,
  HighlightSpan,
  HtmlLinkedFormatter,
} from "../types.js";
import {
  budgetAttrs,
  closingTags,
  formatHtmlLines,
  openCodeTag,
  openPreTag,
  openSpanTag,
  scopeToClass,
  wrapWithHeader,
} from "./html.js";
import { formatHtmlSpans, isInlineStructure } from "./html-structure.js";

function openSpan(span: HighlightSpan): string {
  return openSpanTag({ class: scopeToClass(span.scope) });
}

function openDiffWord(kind: DiffWordKind): string {
  return openSpanTag({ class: diffWordClass(kind) });
}

export function formatHtmlLinked(
  source: string,
  events: readonly HighlightEvent[],
  formatter: HtmlLinkedFormatter,
  budget?: BudgetExhausted,
): string {
  if (isInlineStructure(formatter.structure)) {
    return formatHtmlSpans(source, events, {
      language: formatter.language,
      theme: undefined,
      openSpan,
      openDiffWord,
    });
  }

  const body = formatHtmlLines(source, events, {
    language: formatter.language,
    theme: undefined,
    lines: formatter.highlightLines?.lines,
    lineNumbers: formatter.lineNumbers,
    lineNumberAttrs: { regular: {}, highlighted: {} },
    highlightedAttrs: { className: formatter.highlightLines?.class ?? "l-highlighted" },
    openSpan,
    openDiffWord,
  });

  const pre = openPreTag({
    preClass: formatter.preClass,
    attrs: budgetAttrs(formatter.preAttrs, budget),
  });
  const code = openCodeTag(formatter.language, formatter.codeAttrs);

  return wrapWithHeader(`${pre}${code}${body}${closingTags()}`, formatter.header);
}
