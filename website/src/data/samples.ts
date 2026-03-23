const sampleModules = import.meta.glob<string>(
  ["../../../samples/*.*", "!../../../samples/README.md", "!../../../samples/LICENSE.md"],
  {
    import: "default",
    query: "?raw",
    eager: true,
  },
);

// Map from language id to its sample content
// Sample files are named like "rust.rs", "python.py" — the prefix before the dot is the key
const samples = new Map<string, string>();

for (const [path, content] of Object.entries(sampleModules)) {
  const filename = path.split("/").pop();
  if (!filename) continue;
  const id = filename.substring(0, filename.indexOf("."));
  if (id) {
    samples.set(id, content);
  }
}

// Some bundle language IDs differ from sample filenames
const SAMPLE_ALIASES: Record<string, string> = {
  asm: "assembly",
  ocaml_interface: "ocamlinterface",
};

const DEFAULT_SAMPLE = '// No sample available for this language\nprint("Hello, world!")';

export function getSample(languageId: string): string {
  const mappedId = SAMPLE_ALIASES[languageId] ?? languageId;
  return samples.get(mappedId) ?? DEFAULT_SAMPLE;
}

export function hasSample(languageId: string): boolean {
  const mappedId = SAMPLE_ALIASES[languageId] ?? languageId;
  return samples.has(mappedId);
}
