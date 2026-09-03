import React from "react";
import { createRoot } from "react-dom/client";
import { MarkdownHooks } from "react-markdown";
import rehypeLumis from "@lumis-sh/rehype-lumis";
import githubLight from "@lumis-sh/themes/github_light";

const source = `# Demo

\`\`\`js
export function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

\`\`\`rust
fn main() {
    println!("Hello, world!");
}
\`\`\`
`;

const rehypePlugins = [[rehypeLumis, { theme: githubLight, fallbackLanguage: "plaintext" }]];

function App() {
  return <MarkdownHooks rehypePlugins={rehypePlugins}>{source}</MarkdownHooks>;
}

createRoot(document.querySelector("#app")).render(<App />);
