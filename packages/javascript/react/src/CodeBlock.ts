import type { ReactNode } from "react";
import type { CodeBlockProps } from "./clientShared.js";
import { useLumis } from "./useLumis.js";

export type { CodeBlockProps } from "./clientShared.js";

function throwRenderError(error: unknown): never {
  if (error instanceof Error) {
    throw error;
  }

  throw new Error("Failed to render code block", { cause: error });
}

export function CodeBlock(props: CodeBlockProps): ReactNode {
  const { content, error } = useLumis(props);

  if (error) {
    throwRenderError(error);
  }

  return content;
}
