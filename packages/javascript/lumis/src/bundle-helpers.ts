import type { Language, LazyLanguage } from "./types.js";

export function lazy(
  id: string,
  aliases: string[],
  load: () => Promise<{ default: Language }>,
): LazyLanguage {
  return Object.assign(() => load().then((m) => m.default), { id, aliases });
}
