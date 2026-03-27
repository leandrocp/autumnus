import { renderNav, setupNav } from "./sections/nav";
import { renderHero, setupHero } from "./sections/hero";
import { renderStats } from "./sections/stats";
import { renderPlayground, setupPlayground } from "./sections/playground";
import { renderTokenInspector, setupTokenInspector } from "./sections/token-inspector";
import { renderStreaming, setupStreaming } from "./sections/streaming";
import { renderQuickstart, setupQuickstart } from "./sections/quickstart";
import { renderFormatters } from "./sections/formatters";
import { renderInjections, setupInjections } from "./sections/injections";
import { renderWasm } from "./sections/wasm";
import { renderPlatforms } from "./sections/platforms";
import { renderFooter } from "./sections/footer";
import { setupTabs, setupCopyButtons, SECTION_DIVIDER } from "./lib/utils";

export async function mountApp(root: HTMLDivElement) {
  root.innerHTML = [
    '<a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-zinc-900 focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-white dark:focus:bg-white dark:focus:text-zinc-900">Skip to content</a>',
    renderNav(),
    '<main id="main-content">',
    renderHero(),
    renderStats(),
    renderPlayground(),
    SECTION_DIVIDER,
    renderQuickstart(),
    SECTION_DIVIDER,
    renderPlatforms(),
    SECTION_DIVIDER,
    renderFormatters(),
    SECTION_DIVIDER,
    renderTokenInspector(),
    SECTION_DIVIDER,
    renderStreaming(),
    SECTION_DIVIDER,
    renderInjections(),
    SECTION_DIVIDER,
    renderWasm(),
    "</main>",
    renderFooter(),
    '<div id="live-region" class="sr-only" aria-live="polite" aria-atomic="true"></div>',
  ].join("\n");

  setupNav(root);
  setupHero(root);
  setupTabs(root, ".install-tab", "install", "[data-install-panel]", "installPanel");
  setupCopyButtons(root);

  await setupPlayground(root);
  void setupTokenInspector(root);
  void setupStreaming(root);
  void setupQuickstart(root);
  void setupInjections(root);
}
