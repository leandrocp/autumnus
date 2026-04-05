import type { Highlighter } from "@lumis-sh/lumis";
import type { Formatter } from "@lumis-sh/lumis/formatters";
import type { Root } from "hast";
import type { ReactNode } from "react";
import { createHighlighter } from "@lumis-sh/lumis";
import { fromHtml } from "hast-util-from-html";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, useEffect, useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";

export interface RenderCodeBlockOptions {
  children: string;
  formatter: Formatter;
}

export interface CodeBlockProps extends RenderCodeBlockOptions {
  fallback?: ReactNode;
}

export interface UseCodeBlockResult {
  content: ReactNode;
  isLoading: boolean;
}

type HighlighterInput = Highlighter | Promise<Highlighter>;

function createFallback(source: string): ReactNode {
  return jsx("pre", {
    children: jsx("code", {
      children: source,
    }),
  });
}

function toReactNode(html: string): ReactNode {
  const tree = fromHtml(html, { fragment: true }) as Root;
  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
  }) as ReactNode;
}

async function highlightToReactNode(
  highlighterInput: HighlighterInput,
  options: RenderCodeBlockOptions,
): Promise<ReactNode> {
  const highlighter = await highlighterInput;
  if (options.formatter.language != null) {
    await highlighter.loadLanguage(options.formatter.language);
  }

  const html = highlighter.highlight(options.children, options.formatter);
  return toReactNode(html);
}

export function fromHighlighter(highlighter: HighlighterInput) {
  async function renderCodeBlock(options: RenderCodeBlockOptions): Promise<ReactNode> {
    return highlightToReactNode(highlighter, options);
  }

  function useCodeBlock(props: CodeBlockProps): UseCodeBlockResult {
    const fallback = useMemo(
      () => props.fallback ?? createFallback(props.children),
      [props.children, props.fallback],
    );
    const [content, setContent] = useState<ReactNode>(fallback);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<unknown>();

    useEffect(() => {
      let active = true;

      setContent(fallback);
      setIsLoading(true);
      setError(undefined);

      void highlightToReactNode(highlighter, {
        children: props.children,
        formatter: props.formatter,
      })
        .then((next) => {
          if (!active) {
            return;
          }

          setContent(next);
          setIsLoading(false);
        })
        .catch((nextError) => {
          if (!active) {
            return;
          }

          setError(nextError);
          setIsLoading(false);
        });

      return () => {
        active = false;
      };
    }, [fallback, props.children, props.formatter]);

    if (error) {
      throw error instanceof Error
        ? error
        : new Error(typeof error === "string" ? error : JSON.stringify(error));
    }

    return { content, isLoading };
  }

  function CodeBlock(props: CodeBlockProps): ReactNode {
    const { content } = useCodeBlock(props);
    return content;
  }

  return {
    CodeBlock,
    renderCodeBlock,
    useCodeBlock,
  };
}

const sharedHighlighter = createHighlighter();

export const { CodeBlock, renderCodeBlock, useCodeBlock } = fromHighlighter(sharedHighlighter);
