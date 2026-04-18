import { createHighlighter, type Highlighter } from "@lumis-sh/lumis";
import type { ReactNode } from "react";
import { toReactNode, type LumisBaseOptions } from "./common.js";

export interface RenderCodeBlockOptions extends LumisBaseOptions {
  highlighter?: HighlighterInput;
}

export type HighlighterInput = Highlighter | Promise<Highlighter>;

const sharedHighlighter = createHighlighter();

export function getHighlighter(highlighter?: HighlighterInput): HighlighterInput {
  return highlighter ?? sharedHighlighter;
}

export async function highlightToReactNode(
  highlighterInput: HighlighterInput | undefined,
  options: LumisBaseOptions,
): Promise<ReactNode> {
  const highlighter = await getHighlighter(highlighterInput);
  if (options.formatter.language != null) {
    await highlighter.loadLanguage(options.formatter.language);
  }

  const html = highlighter.highlight(options.children, options.formatter);
  return toReactNode(html);
}
