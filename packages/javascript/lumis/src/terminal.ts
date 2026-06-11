import type { TerminalFormatter, TerminalOptions } from "./types.js";
import { highlightEvents } from "./core/highlighter.js";
import { formatTerminal } from "./formatter/terminal.js";

export function terminal(options: TerminalOptions = {}): TerminalFormatter {
  const formatter: TerminalFormatter = {
    ...options,
    format(source: string): string {
      return formatTerminal(
        source,
        highlightEvents(source, formatter.language, { rainbowBrackets: formatter.rainbowBrackets }),
        formatter,
      );
    },
  };
  return formatter;
}

export type { TerminalFormatter, TerminalOptions } from "./types.js";
