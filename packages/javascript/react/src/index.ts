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

function getLanguageId(language: Formatter["language"]): string | undefined {
  if (typeof language === "string") {
    return language;
  }

  if (typeof language === "object" && language !== null && "id" in language) {
    return language.id;
  }

  return undefined;
}

function isUnknownLanguage(highlighter: Highlighter, language: Formatter["language"]): boolean {
  const languageId = getLanguageId(language);
  return languageId != null && !highlighter.registeredLanguages.includes(languageId);
}

function isLoadedLanguage(highlighter: Highlighter, language: Formatter["language"]): boolean {
  const languageId = getLanguageId(language);
  return languageId != null && highlighter.languages.includes(languageId);
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

    const syncState = useMemo(() => {
      if (isUnknownLanguage(hl, props.formatter.language)) {
        return {
          content: null,
          error: new Error(
            `Language "${getLanguageId(props.formatter.language)}" is not loaded. Pass it to createHighlighter({ languages: [...] }) or call hl.loadLanguage(bundle).`,
          ),
          needsLoad: false,
        };
      }

      if (props.formatter.language != null && !isLoadedLanguage(hl, props.formatter.language)) {
        const languageId = getLanguageId(props.formatter.language);

        if (languageId != null) {
          return {
            content: null,
            error: undefined,
            needsLoad: true,
          };
        }
      }

      try {
        const html = hl.highlight(props.children, props.formatter);
        return {
          content: toReactNode(html),
          error: undefined,
          needsLoad: false,
        };
      } catch (nextError) {
        if (props.formatter.language == null) {
          return { content: null, error: nextError, needsLoad: false };
        }

        if (isLoadedLanguage(hl, props.formatter.language)) {
          return { content: null, error: nextError, needsLoad: false };
        }

        return {
          content: null,
          error: undefined,
          needsLoad: true,
        };
      }
    }, [hl, props.children, props.formatter]);

    useEffect(() => {
      if (!syncState.needsLoad) {
        setAsyncContent(undefined);
        setError(syncState.error);
        return;
      }

      let active = true;

      setError(undefined);

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
    }, [hl, props.children, props.formatter, syncState.error, syncState.needsLoad]);

    const renderError = error ?? syncState.error;

    if (renderError) {
      if (renderError instanceof Error) {
        throw renderError;
      }

      throw new Error("Failed to render code block", { cause: renderError });
    }

    return syncState.needsLoad ? (asyncContent ?? null) : syncState.content;
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
