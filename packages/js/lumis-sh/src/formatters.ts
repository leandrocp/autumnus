import type {
  HtmlInlineOptions,
  HtmlInlineFormatter,
  HtmlLinkedOptions,
  HtmlLinkedFormatter,
  TerminalOptions,
  TerminalFormatter,
} from './types.js'
import { FORMATTER_TAG } from './types.js'

export function htmlInline(options: HtmlInlineOptions = {}): HtmlInlineFormatter {
  return { ...options, [FORMATTER_TAG]: 'html_inline' }
}

export function htmlLinked(options: HtmlLinkedOptions = {}): HtmlLinkedFormatter {
  return { ...options, [FORMATTER_TAG]: 'html_linked' }
}

export function terminal(options: TerminalOptions = {}): TerminalFormatter {
  return { ...options, [FORMATTER_TAG]: 'terminal' }
}
