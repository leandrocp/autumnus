// Next.js overwrites `Vary` with `res.setHeader()` when it renders an App Router page, which drops
// the `Accept` that proxy.ts sets for content negotiation (https://github.com/vercel/next.js/issues/85999).
// Merge the fields instead, so a CDN keeps HTML and Markdown for the same URL apart.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { ServerResponse } = await import("node:http");
  const setHeader = ServerResponse.prototype.setHeader;

  ServerResponse.prototype.setHeader = function (name, value) {
    const merged = name.toLowerCase() === "vary" ? mergeVary(this.getHeader(name), value) : value;
    return setHeader.call(this, name, merged);
  };
}

function mergeVary(...values: unknown[]) {
  const fields = new Map<string, string>();
  for (const field of values.flat().flatMap((value) => String(value ?? "").split(","))) {
    const trimmed = field.trim();
    if (trimmed && !fields.has(trimmed.toLowerCase())) fields.set(trimmed.toLowerCase(), trimmed);
  }
  return [...fields.values()].join(", ");
}
