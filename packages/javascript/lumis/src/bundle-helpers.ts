import type { Language, LanguageBundle, LazyLanguage } from "./types.js";

export function lazy(
  id: string,
  aliases: string[],
  load: () => Promise<{ default: Language }>,
): LazyLanguage {
  return Object.assign(() => load().then((m) => m.default), { id, aliases });
}

export function mapBundle(
  bundle: LanguageBundle,
  map: (language: Language) => Language,
): LanguageBundle {
  return Object.fromEntries(
    Object.entries(bundle).map(([key, handle]) => [
      key,
      Object.assign(() => handle().then(map), { id: handle.id, aliases: handle.aliases }),
    ]),
  );
}
