// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { createHighlighter } from "@lumis-sh/lumis";
import { bundledLanguages } from "@lumis-sh/lumis/bundles/web";
import { htmlInline } from "@lumis-sh/lumis/formatters";
import dracula from "../../themes/themes/dracula.ts";
import githubLight from "../../themes/themes/github_light.ts";
import { fromHighlighter } from "../src/index.js";

const SOURCE = "const x = 1";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("@lumis-sh/react", () => {
  it("renders highlighted React nodes on the server", async () => {
    const highlighter = await createHighlighter();
    const { renderCodeBlock } = fromHighlighter(highlighter);

    const node = await renderCodeBlock({
      children: SOURCE,
      formatter: htmlInline({ language: bundledLanguages.javascript, theme: dracula }),
    });

    const html = renderToStaticMarkup(node);

    expect(html).toMatch(
      /<pre class="lumis" style="color:#[0-9a-f]+;background-color:#[0-9a-f]+">/,
    );
    expect(html).toMatch(/<code class="language-javascript"/);
    expect(html).toMatch(/<span style="color:#[0-9a-f]+">const<\/span>/);
  });

  it("supports string formatter languages through fromHighlighter", async () => {
    const highlighter = await createHighlighter({ languages: [bundledLanguages] });
    const { renderCodeBlock } = fromHighlighter(highlighter);

    const node = await renderCodeBlock({
      children: SOURCE,
      formatter: htmlInline({ language: "javascript", theme: dracula }),
    });

    const html = renderToStaticMarkup(node);

    expect(html).toContain('class="language-javascript"');
    expect(html).toContain('<pre class="lumis"');
  });

  it("renders synchronously when given a resolved highlighter", async () => {
    const highlighter = await createHighlighter({ languages: [bundledLanguages] });
    await highlighter.loadLanguage("javascript");
    const { CodeBlock } = fromHighlighter(highlighter);
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <CodeBlock formatter={htmlInline({ language: "javascript", theme: dracula })}>
          {SOURCE}
        </CodeBlock>,
      );
    });

    expect(container.innerHTML).toContain('class="lumis"');
    expect(container.innerHTML).toContain('class="language-javascript"');

    await act(async () => {
      root.unmount();
    });
  });

  it("loads a lazy language then highlights on a resolved highlighter", async () => {
    const highlighter = await createHighlighter({ languages: [bundledLanguages] });
    const { CodeBlock } = fromHighlighter(highlighter);
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <CodeBlock formatter={htmlInline({ language: "javascript", theme: dracula })}>
          {SOURCE}
        </CodeBlock>,
      );
    });

    // Language not loaded yet, renders null initially
    expect(container.innerHTML).toBe("");

    // Wait for loadLanguage (WASM loading) + highlight to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    expect(container.innerHTML).toContain('class="lumis"');
    expect(container.innerHTML).toContain('class="language-javascript"');

    await act(async () => {
      root.unmount();
    });
  });

  it("renders null then highlights when given a promise", async () => {
    const deferred = createDeferred<Awaited<ReturnType<typeof createHighlighter>>>();
    const { CodeBlock } = fromHighlighter(deferred.promise);
    const container = document.createElement("div");
    document.body.append(container);

    const root = createRoot(container);
    const highlighter = await createHighlighter({ languages: [bundledLanguages] });
    await highlighter.loadLanguage("javascript");

    await act(async () => {
      root.render(
        <CodeBlock formatter={htmlInline({ language: "javascript", theme: dracula })}>
          {SOURCE}
        </CodeBlock>,
      );
    });

    expect(container.innerHTML).toBe("");

    await act(async () => {
      deferred.resolve(highlighter);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container.innerHTML).toContain('class="lumis"');
    expect(container.innerHTML).toContain('class="language-javascript"');

    await act(async () => {
      root.unmount();
    });
  });

  it("re-highlights when the formatter changes", async () => {
    const highlighter = await createHighlighter({ languages: [bundledLanguages] });
    await highlighter.loadLanguage("javascript");
    const { CodeBlock } = fromHighlighter(highlighter);
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <CodeBlock formatter={htmlInline({ language: "javascript", theme: dracula })}>
          {SOURCE}
        </CodeBlock>,
      );
    });

    const firstHtml = container.innerHTML;
    expect(firstHtml).toContain('class="lumis"');

    await act(async () => {
      root.render(
        <CodeBlock formatter={htmlInline({ language: "javascript", theme: githubLight })}>
          {SOURCE}
        </CodeBlock>,
      );
    });

    const secondHtml = container.innerHTML;
    expect(secondHtml).toContain('class="lumis"');
    expect(secondHtml).not.toEqual(firstHtml);

    await act(async () => {
      root.unmount();
    });
  });
});
