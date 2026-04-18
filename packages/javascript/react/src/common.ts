import type { Formatter } from "@lumis-sh/lumis/formatters";
import type { Root } from "hast";
import type { ReactNode } from "react";
import { fromHtml } from "hast-util-from-html";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";

export interface LumisBaseOptions {
  children: string;
  formatter: Formatter;
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

export function toReactNode(html: string): ReactNode {
  const tree = fromHtml(html, { fragment: true }) as Root;
  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
  }) as ReactNode;
}
