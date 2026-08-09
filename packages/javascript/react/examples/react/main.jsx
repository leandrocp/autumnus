import { createRoot } from "react-dom/client";
import { createHighlighter, withWasmBundle } from "@lumis-sh/lumis";
import { bundledLanguages } from "@lumis-sh/lumis/bundles/web";
import { bundledWasms } from "@lumis-sh/wasm-bundle-web";
import { CodeBlock } from "@lumis-sh/react";
import { htmlInline, htmlMultiThemes } from "@lumis-sh/lumis/formatters";
import githubDark from "@lumis-sh/themes/github_dark";
import githubLight from "@lumis-sh/themes/github_light";

const languages = withWasmBundle(bundledLanguages, bundledWasms);

const highlighter = await createHighlighter({ languages: [languages] });
await Promise.all([highlighter.loadLanguage("javascript"), highlighter.loadLanguage("tsx")]);

function App() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", margin: "2rem auto", maxWidth: 880 }}>
      <h1>Lumis React</h1>

      <CodeBlock
        highlighter={highlighter}
        formatter={htmlInline({ language: "javascript", theme: githubLight })}
      >
        {`export function greet(name) {
  return \`Hello, \${name}!\`
}`}
      </CodeBlock>

      <div style={{ height: 24 }} />

      <CodeBlock
        highlighter={highlighter}
        formatter={htmlMultiThemes({
          language: "tsx",
          themes: { light: githubLight, dark: githubDark },
          defaultTheme: "light-dark()",
        })}
      >
        {`export function Button() {
  return <button type="button">Click me</button>
}`}
      </CodeBlock>
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<App />);
