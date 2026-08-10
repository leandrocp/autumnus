import type { ReactNode } from "react";
import type { CodeBlockProps } from "./clientShared.js";
import { useLumis } from "./useLumis.js";

export type { CodeBlockProps } from "./clientShared.js";

export function CodeBlock(props: CodeBlockProps): ReactNode {
  const { content, error } = useLumis(props);

  if (error) {
    throw error;
  }

  return content;
}
