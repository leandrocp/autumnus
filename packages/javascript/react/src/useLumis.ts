import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { LumisOptions } from "./clientShared.js";
import {
  getHighlighter,
  getLanguageId,
  highlightToReactNode,
  isHighlighterPromise,
  isLoadedLanguage,
  isUnknownLanguage,
  toReactNode,
} from "./clientShared.js";

export interface UseLumisOptions extends LumisOptions {}

export interface UseLumisResult {
  content: ReactNode | null;
  error: unknown;
  isLoading: boolean;
}

export function useLumis(options: UseLumisOptions): UseLumisResult {
  const [asyncContent, setAsyncContent] = useState<ReactNode>(undefined);
  const [asyncError, setAsyncError] = useState<unknown>();
  const highlighter = getHighlighter(options.highlighter);

  const syncState = useMemo(() => {
    if (isHighlighterPromise(highlighter)) {
      return {
        content: null,
        error: undefined,
        needsLoad: true,
      };
    }

    if (isUnknownLanguage(highlighter, options.formatter.language)) {
      return {
        content: null,
        error: new Error(
          `Language "${getLanguageId(options.formatter.language)}" is not loaded. Pass it to createHighlighter({ languages: [...] }) or call hl.loadLanguage(bundle).`,
        ),
        needsLoad: false,
      };
    }

    if (
      options.formatter.language != null &&
      !isLoadedLanguage(highlighter, options.formatter.language) &&
      getLanguageId(options.formatter.language) != null
    ) {
      return {
        content: null,
        error: undefined,
        needsLoad: true,
      };
    }

    try {
      const html = highlighter.highlight(options.children, options.formatter);
      return {
        content: toReactNode(html),
        error: undefined,
        needsLoad: false,
      };
    } catch (error) {
      if (
        options.formatter.language != null &&
        !isLoadedLanguage(highlighter, options.formatter.language)
      ) {
        return {
          content: null,
          error: undefined,
          needsLoad: true,
        };
      }

      return {
        content: null,
        error,
        needsLoad: false,
      };
    }
  }, [highlighter, options.children, options.formatter]);

  useEffect(() => {
    if (!syncState.needsLoad) {
      setAsyncContent(undefined);
      setAsyncError(undefined);
      return;
    }

    let active = true;

    setAsyncContent(undefined);
    setAsyncError(undefined);

    void highlightToReactNode(highlighter, options)
      .then((content) => {
        if (active) {
          setAsyncContent(content);
        }
      })
      .catch((error) => {
        if (active) {
          setAsyncError(error);
        }
      });

    return () => {
      active = false;
    };
  }, [highlighter, options.children, options.formatter, syncState.needsLoad]);

  return {
    content: syncState.needsLoad ? (asyncContent ?? null) : syncState.content,
    error: asyncError ?? syncState.error,
    isLoading: syncState.needsLoad && asyncContent == null && asyncError == null,
  };
}
