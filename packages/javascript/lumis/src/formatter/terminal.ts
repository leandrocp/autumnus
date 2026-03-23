import type { HighlightEvent, TerminalFormatter } from "../types.js";
import { encodeSource, decodeSourceSlice, getScopedThemeStyle } from "./html.js";
import { wrapWithAnsi } from "./ansi.js";

export function formatTerminal(
  source: string,
  events: HighlightEvent[],
  formatter: TerminalFormatter,
): string {
  let output = "";
  const sourceBytes = encodeSource(source);
  const scopeStack: Array<{ scope: string; language: string }> = [];

  for (const event of events) {
    if (event.type === "start") {
      scopeStack.push({ scope: event.scope, language: event.language });
      continue;
    }

    if (event.type === "end") {
      scopeStack.pop();
      continue;
    }

    const text = decodeSourceSlice(sourceBytes, event.startByte, event.endByte);

    const active = scopeStack[scopeStack.length - 1];
    if (active && active.scope.length > 0) {
      const style = getScopedThemeStyle(formatter.theme, active.scope, active.language);
      output += wrapWithAnsi(text, style);
    } else {
      output += text;
    }
  }

  return output;
}
