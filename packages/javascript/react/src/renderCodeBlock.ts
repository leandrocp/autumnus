import type { ReactNode } from "react";
import type { RenderCodeBlockOptions } from "./shared.js";
import { highlightToReactNode } from "./shared.js";

export async function renderCodeBlock(options: RenderCodeBlockOptions): Promise<ReactNode> {
  return highlightToReactNode(options.highlighter, options);
}
