/**
 * The demo fixture: a pinned Three.js example, already vendored in this
 * repository at `benchmarks/webgpu_compute_reduce.html`.
 *
 * The demos used to download it on every run. They read the checked-in copy
 * instead, so they work offline and cannot drift from the benchmarks, which
 * highlight the same bytes. `verifySource` keeps that honest.
 */
export const sourceUrl =
  "https://github.com/mrdoob/three.js/blob/6365c1a0af6a32ed45f99712197555fee2f4b24a/examples/webgpu_compute_reduce.html";

/** Repository copy, relative to this module. */
export const sourcePath = new URL(
  "../../../benchmarks/webgpu_compute_reduce.html",
  import.meta.url,
);

const expectedSha256 = "e1b31d91c25e9103931d7e830b9dfb9e075d97c175623e3e44fb3dc3685067af";
const expectedLines = 1397;

/**
 * Check the fixture is the exact file the demos claim to highlight.
 *
 * Shared by both demos; only the loading differs, because Node reads from disk
 * while the browser gets the text inlined by its bundler.
 */
export async function verifySource(source) {
  const bytes = new TextEncoder().encode(source);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  const sha256 = Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");

  if (sha256 !== expectedSha256) {
    throw new Error(`Fixture SHA-256 mismatch: expected ${expectedSha256}, got ${sha256}`);
  }

  const lineCount = source.replace(/\n$/, "").split("\n").length;
  if (lineCount !== expectedLines) {
    throw new Error(`Expected ${expectedLines} source lines, got ${lineCount}`);
  }

  return source;
}

/** Node.js: read the repository copy. */
export async function loadSource() {
  const { readFile } = await import("node:fs/promises");
  return verifySource(await readFile(sourcePath, "utf8"));
}
