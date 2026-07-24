export const sourceUrl =
  "https://raw.githubusercontent.com/mrdoob/three.js/6365c1a0af6a32ed45f99712197555fee2f4b24a/examples/webgpu_compute_reduce.html";

const expectedSha256 = "e1b31d91c25e9103931d7e830b9dfb9e075d97c175623e3e44fb3dc3685067af";
const expectedLines = 1397;

export async function loadSource() {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Could not fetch fixture: ${response.status} ${response.statusText}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  const sha256 = Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");

  if (sha256 !== expectedSha256) {
    throw new Error(`Fixture SHA-256 mismatch: expected ${expectedSha256}, got ${sha256}`);
  }

  const source = new TextDecoder().decode(bytes);
  const lineCount = source.replace(/\n$/, "").split("\n").length;
  if (lineCount !== expectedLines) {
    throw new Error(`Expected ${expectedLines} source lines, got ${lineCount}`);
  }

  return source;
}
