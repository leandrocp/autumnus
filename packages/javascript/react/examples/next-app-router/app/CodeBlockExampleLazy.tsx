"use client";

import dynamic from "next/dynamic";

const CodeBlockExample = dynamic(
  () => import("./CodeBlockExample").then((mod) => mod.CodeBlockExample),
  {
    ssr: false,
  },
);

export function CodeBlockExampleLazy() {
  return <CodeBlockExample />;
}
