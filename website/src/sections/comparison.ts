import { ACTIVE_TAB_CLASSES, INACTIVE_TAB_CLASSES } from "../lib/utils";

const DATA = "/comparison-data";

interface ComparisonDocument {
  id: string;
  label: string;
  language: string;
  languageLabel: string;
  source: string;
  lines: number;
  injections: string[];
}

interface Manifest {
  theme: { name: string; source: string };
  lumisRuntimes: string[];
  implementations: Array<{ id: string; label: string; version: string; theme: string }>;
  documents: ComparisonDocument[];
}

export function renderComparison() {
  return `
    <section id="comparison" class="pt-32 pb-24 sm:pt-40 sm:pb-36">
      <div class="mx-auto max-w-6xl px-6">
        <h1 class="inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider">
          <span class="text-orange-400">&lt;</span><span class="text-cyan-400">Comparison</span> <span class="text-orange-400">/&gt;</span>
        </h1>

        <div class="comparison-shell mt-8 border border-zinc-200 dark:border-zinc-800">
          <div class="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <div class="comparison-documents flex flex-wrap gap-2" role="tablist" aria-label="Document"></div>
            <p class="comparison-summary mt-3 font-mono text-[11px] tracking-wider text-zinc-500 dark:text-zinc-400"></p>
          </div>
          <div class="overflow-x-auto border-b border-zinc-200 px-5 dark:border-zinc-800">
            <div class="comparison-implementations flex min-w-max gap-6" role="tablist" aria-label="Implementation"></div>
          </div>
          <div class="comparison-viewport h-[70vh] min-h-[420px] bg-[#171821]">
            <iframe class="comparison-frame block h-full w-full border-0" title="Highlighted output" loading="eager"></iframe>
          </div>
        </div>

        <p class="comparison-missing mt-6 hidden font-mono text-sm text-zinc-500 dark:text-zinc-400"></p>

        <div class="mt-6 border border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <p class="font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
            How this was produced
          </p>
          <p class="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Each library renders the same file at its current release, through its own public API,
            with the closest Dracula it ships. Those Draculas are different files, so some colour
            differences are the theme rather than the parse.
          </p>
          <dl class="comparison-provenance mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]"></dl>
        </div>
      </div>
    </section>`;
}

export async function setupComparison(root: HTMLElement) {
  const documentTabs = root.querySelector<HTMLDivElement>(".comparison-documents")!;
  const implementationTabs = root.querySelector<HTMLDivElement>(".comparison-implementations")!;
  const summary = root.querySelector<HTMLParagraphElement>(".comparison-summary")!;
  const frame = root.querySelector<HTMLIFrameElement>(".comparison-frame")!;
  const shell = root.querySelector<HTMLDivElement>(".comparison-shell")!;
  const missing = root.querySelector<HTMLParagraphElement>(".comparison-missing")!;

  let manifest: Manifest;
  try {
    const response = await fetch(`${DATA}/manifest.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    manifest = (await response.json()) as Manifest;
  } catch {
    shell.classList.add("hidden");
    missing.classList.remove("hidden");
    missing.textContent =
      "The comparison assets are not published in this build. Run `mise run -C benchmarks showcase-publish` and reload.";
    return;
  }

  // Switching either tab reloads the frame, so the frame reports where it is and
  // the next page is asked to resume there. Positions are kept per document,
  // because the same offset in a different file is not the same place, while the
  // same offset in a different implementation of one file is.
  const provenance = root.querySelector<HTMLDListElement>(".comparison-provenance")!;
  for (const entry of manifest.implementations) {
    const term = document.createElement("dt");
    term.className = "font-mono text-xs tracking-wider text-zinc-900 uppercase dark:text-white";
    term.textContent = entry.version;
    const detail = document.createElement("dd");
    detail.className = "text-zinc-600 dark:text-zinc-400";
    detail.textContent = entry.theme;
    provenance.append(term, detail);
  }

  const positions = new Map<string, { x: number; y: number }>();
  let currentDocument = manifest.documents[0]!;
  let currentImplementation = manifest.implementations[0]!;

  addEventListener("message", (event: MessageEvent) => {
    const scroll = (event.data as { lumisShowcaseScroll?: { x: number; y: number } } | null)
      ?.lumisShowcaseScroll;
    if (scroll) positions.set(currentDocument.id, scroll);
  });

  function describe() {
    const injections = currentDocument.injections.length
      ? ` + ${currentDocument.injections.join(" + ")}`
      : "";
    summary.replaceChildren(
      `${manifest.theme.name} · ${currentDocument.languageLabel}${injections} · ` +
        `${currentDocument.lines.toLocaleString()} lines · ${currentDocument.label} · `,
    );
    const link = document.createElement("a");
    link.href = currentDocument.source;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.className = "text-cyan-600 underline-offset-2 hover:underline dark:text-cyan-400";
    link.textContent = "Original source";
    summary.append(link);
  }

  function show() {
    const at = positions.get(currentDocument.id) ?? { x: 0, y: 0 };
    frame.src = `${DATA}/${currentDocument.id}/${currentImplementation.id}.html#at=${at.x},${at.y}`;
    frame.title = `${currentImplementation.label} highlighting ${currentDocument.label}`;
    describe();
  }

  function paint(container: HTMLElement, selected: string) {
    for (const button of Array.from(container.children) as HTMLButtonElement[]) {
      const isSelected = button.dataset.id === selected;
      button.setAttribute("aria-selected", String(isSelected));
      button.classList.remove(...ACTIVE_TAB_CLASSES, ...INACTIVE_TAB_CLASSES);
      button.classList.add(...(isSelected ? ACTIVE_TAB_CLASSES : INACTIVE_TAB_CLASSES));
    }
  }

  for (const entry of manifest.documents) {
    const button = document.createElement("button");
    button.dataset.id = entry.id;
    button.setAttribute("role", "tab");
    button.className =
      "cursor-pointer border border-zinc-300 px-3 py-1.5 font-mono text-xs tracking-wider uppercase transition-colors dark:border-zinc-700";
    button.textContent = entry.label;
    button.addEventListener("click", () => {
      currentDocument = entry;
      paint(documentTabs, entry.id);
      show();
    });
    documentTabs.append(button);
  }

  for (const entry of manifest.implementations) {
    const button = document.createElement("button");
    button.dataset.id = entry.id;
    button.setAttribute("role", "tab");
    button.className =
      "cursor-pointer border-b-2 py-3 font-mono text-xs tracking-wider whitespace-nowrap uppercase transition-colors";
    button.textContent = entry.label;
    button.addEventListener("click", () => {
      currentImplementation = entry;
      paint(implementationTabs, entry.id);
      show();
    });
    implementationTabs.append(button);
  }

  paint(documentTabs, currentDocument.id);
  paint(implementationTabs, currentImplementation.id);
  show();
}
