import { htmlInline } from "@lumis-sh/lumis/formatters";
import { renderCodeBlock } from "@lumis-sh/react/server";
import githubLight from "@lumis-sh/themes/github_light";
import { CodeBlockExampleLazy } from "./CodeBlockExampleLazy";

export default async function Page() {
  const serverBlock = await renderCodeBlock({
    children: `export async function Article() {
  const post = await fetch("https://example.com/api/post").then((res) => res.json())
  return <article>{post.title}</article>
}`,
    formatter: htmlInline({
      language: "tsx",
      theme: githubLight,
    }),
  });

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        margin: "0 auto",
        maxWidth: 880,
        padding: "48px 24px",
      }}
    >
      <h1>Lumis React with Next.js App Router</h1>
      <p>
        The first block is rendered on the server with <code>@lumis-sh/react/server</code>.
      </p>
      {serverBlock}

      <div style={{ height: 32 }} />

      <p>
        The second block is a client component using <code>CodeBlock</code>.
      </p>
      <CodeBlockExampleLazy />
    </main>
  );
}
