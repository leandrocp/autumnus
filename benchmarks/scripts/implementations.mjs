export const implementations = [
  { id: "lumis-rust", label: "Lumis Rust", runner: "criterion" },
  { id: "lumis-js-wasm", label: "Lumis JavaScript Wasm", runner: "mitata" },
  { id: "lumis-js-node", label: "Lumis JavaScript Node", runner: "mitata" },
  { id: "lumis-elixir", label: "Lumis Elixir", runner: "benchee" },
  { id: "lumis-cli", label: "Lumis CLI", runner: "hyperfine" },
  { id: "shiki", label: "Shiki", runner: "mitata" },
  { id: "highlight-js", label: "highlight.js", runner: "mitata" },
  { id: "syntect", label: "syntect", runner: "criterion" },
  { id: "bat", label: "bat", runner: "hyperfine" },
];

const implementationsById = new Map(
  implementations.map((implementation) => [implementation.id, implementation]),
);

export function implementationById(id) {
  const implementation = implementationsById.get(id);
  if (!implementation) throw new Error(`unknown benchmark implementation: ${id}`);
  return implementation;
}
