// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { act, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { createHighlighter } from "@lumis-sh/lumis";
import { bundledLanguages } from "@lumis-sh/lumis/bundles/web";
import { htmlInline } from "@lumis-sh/lumis/formatters";
import dracula from "../../themes/themes/dracula.ts";
import { CodeBlock, fromHighlighter } from "../src/index.js";

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

    expect(html).toMatch(/<pre class="lumis" style="color:#[0-9a-f]+;background-color:#[0-9a-f]+">/);
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
    expect(html).toContain("<pre class=\"lumis\"");
  });

  it("renders a fallback first and then highlights on the client", async () => {
    const deferred = createDeferred<Awaited<ReturnType<typeof createHighlighter>>>();
    const { CodeBlock: BoundCodeBlock } = fromHighlighter(deferred.promise);
    const container = document.createElement("div");
    document.body.append(container);

    const root = createRoot(container);
    const highlighter = await createHighlighter({ languages: [bundledLanguages] });
    await highlighter.loadLanguage("javascript");

    await act(async () => {
      root.render(
        <BoundCodeBlock formatter={htmlInline({ language: "javascript", theme: dracula })}>
          {SOURCE}
        </BoundCodeBlock>,
      );
    });

    expect(container.innerHTML).toContain("<pre><code>const x = 1</code></pre>");

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

  it("exposes a hook for custom client rendering", async () => {
    const deferred = createDeferred<Awaited<ReturnType<typeof createHighlighter>>>();
    const { useCodeBlock } = fromHighlighter(deferred.promise);
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const highlighter = await createHighlighter({ languages: [bundledLanguages] });
    await highlighter.loadLanguage("javascript");

    function HookHarness() {
      const formatter = useMemo(
        () => htmlInline({ language: "javascript", theme: dracula }),
        [],
      );

      const { content, isLoading } = useCodeBlock({
        children: SOURCE,
        formatter,
      });

      return <div data-loading={isLoading ? "yes" : "no"}>{content}</div>;
    }

    await act(async () => {
      root.render(<HookHarness />);
    });

    expect(container.innerHTML).toContain('data-loading="yes"');

    await act(async () => {
      deferred.resolve(highlighter);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container.innerHTML).toContain('data-loading="no"');
    expect(container.innerHTML).toContain('class="lumis"');

    await act(async () => {
      root.unmount();
    });
  });
});
