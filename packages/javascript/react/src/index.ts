import type { Highlighter } from "@lumis-sh/lumis";
import type { Formatter } from "@lumis-sh/lumis/formatters";
import type { Root } from "hast";
import type { ReactNode } from "react";
import { createHighlighter } from "@lumis-sh/lumis";
import { fromHtml } from "hast-util-from-html";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, useEffect, useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";

export interface CodeBlockProps {
  children: string;
  formatter: Formatter;
}

type HighlighterInput = Highlighter | Promise<Highlighter>;

function toReactNode(html: string): ReactNode {
  const tree = fromHtml(html, { fragment: true }) as Root;
  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
  }) as ReactNode;
}

async function highlightToReactNode(
  highlighterInput: Highlighter | Promise<Highlighter>,
  options: CodeBlockProps,
): Promise<ReactNode> {
  const highlighter = await highlighterInput;
  if (options.formatter.language != null) {
    await highlighter.loadLanguage(options.formatter.language);
  }

  const html = highlighter.highlight(options.children, options.formatter);
  return toReactNode(html);
}

export function fromHighlighter(highlighter: HighlighterInput) {
  async function renderCodeBlock(options: CodeBlockProps): Promise<ReactNode> {
    const hl = await highlighter;
    if (options.formatter.language != null) {
      await hl.loadLanguage(options.formatter.language);
    }

    const html = hl.highlight(options.children, options.formatter);
    return toReactNode(html);
  }

  function SyncCodeBlock(props: CodeBlockProps): ReactNode {
    const hl = highlighter as Highlighter;
    const [asyncContent, setAsyncContent] = useState<ReactNode>(undefined);
    const [error, setError] = useState<unknown>();

    const needsLoad =
      props.formatter.language != null &&
      typeof props.formatter.language === "string" &&
      !hl.languages.includes(props.formatter.language);

    const syncContent = useMemo(() => {
      if (needsLoad) {
        return null;
      }

      const html = hl.highlight(props.children, props.formatter);
      return toReactNode(html);
    }, [hl, needsLoad, props.children, props.formatter]);

    useEffect(() => {
      if (!needsLoad) {
        setAsyncContent(undefined);
        return;
      }

      let active = true;

      void highlightToReactNode(hl, {
        children: props.children,
        formatter: props.formatter,
      })
        .then((next) => {
          if (active) {
            setAsyncContent(next);
          }
        })
        .catch((nextError) => {
          if (active) {
            setError(nextError);
          }
        });

      return () => {
        active = false;
      };
    }, [hl, needsLoad, props.children, props.formatter]);

    if (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Failed to render code block", { cause: error });
    }

    return needsLoad ? (asyncContent ?? null) : syncContent;
  }

  function AsyncCodeBlock(props: CodeBlockProps): ReactNode {
    const [content, setContent] = useState<ReactNode>(null);
    const [error, setError] = useState<unknown>();

    useEffect(() => {
      let active = true;

      setContent(null);
      setError(undefined);

      void highlightToReactNode(highlighter, {
        children: props.children,
        formatter: props.formatter,
      })
        .then((next) => {
          if (active) {
            setContent(next);
          }
        })
        .catch((nextError) => {
          if (active) {
            setError(nextError);
          }
        });

      return () => {
        active = false;
      };
    }, [props.children, props.formatter]);

    if (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Failed to render code block", { cause: error });
    }

    return content;
  }

  const CodeBlock = highlighter instanceof Promise ? AsyncCodeBlock : SyncCodeBlock;

  return {
    CodeBlock,
    renderCodeBlock,
  };
}

const sharedHighlighter = createHighlighter();

export const { CodeBlock, renderCodeBlock } = fromHighlighter(sharedHighlighter);
