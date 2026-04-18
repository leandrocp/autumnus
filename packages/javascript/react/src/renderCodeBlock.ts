import type { ReactNode } from "react";
import type { RenderCodeBlockOptions } from "./serverShared.js";
import { highlightToReactNode } from "./serverShared.js";

export async function renderCodeBlock(options: RenderCodeBlockOptions): Promise<ReactNode> {
  return highlightToReactNode(options.highlighter, options);
}
