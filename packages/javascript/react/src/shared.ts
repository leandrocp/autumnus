import { createHighlighter, type Highlighter } from "@lumis-sh/lumis";
import type { Formatter } from "@lumis-sh/lumis/formatters";
import type { Root } from "hast";
import type { ReactNode } from "react";
import { fromHtml } from "hast-util-from-html";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";

export interface LumisOptions {
  children: string;
  formatter: Formatter;
  highlighter?: HighlighterInput;
}

export interface CodeBlockProps extends LumisOptions {}

export interface RenderCodeBlockOptions extends LumisOptions {}

export type HighlighterInput = Highlighter | Promise<Highlighter>;

const sharedHighlighter = createHighlighter();

export function getHighlighter(highlighter?: HighlighterInput): HighlighterInput {
  return highlighter ?? sharedHighlighter;
}

export function isHighlighterPromise(
  highlighter: HighlighterInput,
): highlighter is Promise<Highlighter> {
  return highlighter instanceof Promise;
}

export function getLanguageId(language: Formatter["language"]): string | undefined {
  if (typeof language === "string") {
    return language;
  }

  if (typeof language === "object" && language !== null && "id" in language) {
    return language.id;
  }

  return undefined;
}

export function isUnknownLanguage(
  highlighter: Highlighter,
  language: Formatter["language"],
): boolean {
  const languageId = getLanguageId(language);
  return languageId != null && !highlighter.registeredLanguages.includes(languageId);
}

export function isLoadedLanguage(
  highlighter: Highlighter,
  language: Formatter["language"],
): boolean {
  const languageId = getLanguageId(language);
  return languageId != null && highlighter.languages.includes(languageId);
}

export function toReactNode(html: string): ReactNode {
  const tree = fromHtml(html, { fragment: true }) as Root;
  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
  }) as ReactNode;
}

export async function highlightToReactNode(
  highlighterInput: HighlighterInput | undefined,
  options: Pick<LumisOptions, "children" | "formatter">,
): Promise<ReactNode> {
  const highlighter = await getHighlighter(highlighterInput);
  if (options.formatter.language != null) {
    await highlighter.loadLanguage(options.formatter.language);
  }

  const html = highlighter.highlight(options.children, options.formatter);
  return toReactNode(html);
}
