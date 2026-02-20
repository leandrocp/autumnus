/**
 * Core highlighting engine — port of the algorithm from
 * crates/lumis/src/vendor/tree_sitter_highlight.rs
 *
 * Phase 1: Single layer, no injections, no locals.
 * Uses web-tree-sitter's Query.captures() which returns a flat sorted array.
 */

import type { LoadedLanguage, StyledSegment, ThemeData, Style } from './types.js'
import { getStyle } from './themes.js'
import { HIGHLIGHT_NAMES } from './constants.js'

interface CaptureItem {
  name: string
  node: { startIndex: number; endIndex: number }
}

/**
 * Highlight source code and return styled segments.
 *
 * This is the core algorithm, simplified for Phase 1:
 * 1. Parse the source with tree-sitter
 * 2. Run the highlights query to get captures
 * 3. Map captures to a flat event stream (highlightStart/source/highlightEnd)
 * 4. Resolve styles from theme
 */
export function highlight(
  source: string,
  lang: LoadedLanguage,
  theme?: ThemeData
): StyledSegment[] {
  const tree = lang.parser.parse(source)!
  const rootNode = tree.rootNode

  // Get all captures from the highlights query
  const captures = lang.highlightsQuery.captures(rootNode)

  // Build a scope name lookup from capture names
  // web-tree-sitter captures returns: { name: string, node: SyntaxNode }[]
  // We need to map capture names to our HIGHLIGHT_NAMES

  // Sort captures by start position, then by length (longer matches first for nested)
  const sorted = captures.slice().sort((a, b) => {
    const startDiff = a.node.startIndex - b.node.startIndex
    if (startDiff !== 0) return startDiff
    // Longer spans first (outer before inner)
    return b.node.endIndex - a.node.endIndex
  })

  // Convert captures into highlight events
  const segments: StyledSegment[] = []
  let pos = 0

  // Build interval structure: for each byte position, what's the active scope?
  // Simple approach: iterate through captures, emit segments for gaps and highlighted regions
  processCaptures(source, sorted, lang, theme, segments)

  tree.delete()
  return segments
}

/**
 * Process captures into styled segments.
 *
 * Strategy: Build a list of non-overlapping highlight ranges by processing captures.
 * When captures nest, the innermost (most specific) capture wins for its range.
 */
function processCaptures(
  source: string,
  captures: CaptureItem[],
  lang: LoadedLanguage,
  theme: ThemeData | undefined,
  segments: StyledSegment[]
): void {
  if (source.length === 0) return

  // Build a map of byte position -> scope using a sweep approach
  // Each capture defines a range [start, end) with a scope name
  // We want the most specific (innermost/last-defined) scope for each position

  interface Span {
    start: number
    end: number
    scope: string
  }

  // Collect all spans from captures
  const spans: Span[] = []
  for (const cap of captures) {
    const scope = resolveScopeName(cap.name)
    if (scope) {
      spans.push({
        start: cap.node.startIndex,
        end: cap.node.endIndex,
        scope,
      })
    }
  }

  // Sort by start position, then by specificity (later definition wins for same start)
  // In tree-sitter queries, later patterns override earlier ones for the same node

  // Build non-overlapping segments using an event-based approach
  // Events: (position, type: 'start'|'end', scope, priority)
  interface Event {
    pos: number
    type: 'start' | 'end'
    scope: string
    index: number // original index for priority (higher = more specific)
  }

  const events: Event[] = []
  for (let i = 0; i < spans.length; i++) {
    events.push({ pos: spans[i].start, type: 'start', scope: spans[i].scope, index: i })
    events.push({ pos: spans[i].end, type: 'end', scope: spans[i].scope, index: i })
  }

  events.sort((a, b) => {
    if (a.pos !== b.pos) return a.pos - b.pos
    // Ends before starts at same position
    if (a.type !== b.type) return a.type === 'end' ? -1 : 1
    return 0
  })

  // Walk through events maintaining a scope stack
  const scopeStack: { scope: string; index: number }[] = []
  let currentPos = 0

  function emitSegment(end: number): void {
    if (end <= currentPos) return
    const text = source.slice(currentPos, end)
    if (text.length === 0) return

    const activeScope = scopeStack.length > 0 ? scopeStack[scopeStack.length - 1].scope : ''
    const style = theme && activeScope ? getStyle(theme, activeScope, lang.definition.id) : {}

    segments.push({ text, scope: activeScope, style })
    currentPos = end
  }

  for (const event of events) {
    if (event.pos > currentPos) {
      emitSegment(event.pos)
    }

    if (event.type === 'start') {
      scopeStack.push({ scope: event.scope, index: event.index })
    } else {
      // Remove this scope from the stack
      const idx = scopeStack.findLastIndex(
        (s) => s.scope === event.scope && s.index === event.index
      )
      if (idx !== -1) {
        scopeStack.splice(idx, 1)
      }
    }
  }

  // Emit remaining text after last event
  if (currentPos < source.length) {
    emitSegment(source.length)
  }
}

/**
 * Resolve a capture name to a recognized HIGHLIGHT_NAMES scope.
 * Capture names from queries may be like "@variable.parameter" (without @)
 * or may match directly.
 *
 * Uses the same matching logic as tree-sitter's configure():
 * A recognized name matches if all its dot-separated parts appear in the capture name.
 */
function resolveScopeName(captureName: string): string | undefined {
  // Strip leading @ if present
  const name = captureName.startsWith('@') ? captureName.slice(1) : captureName

  // Skip internal captures (start with _)
  if (name.startsWith('_')) return undefined

  // Skip special captures used for injections/locals
  if (
    name === 'injection.content' ||
    name === 'injection.language' ||
    name.startsWith('local.')
  ) {
    return undefined
  }

  // Try exact match first
  if (HIGHLIGHT_NAMES.includes(name)) return name

  // Try matching by parts (most specific match)
  const captureParts = name.split('.')
  let bestMatch: string | undefined
  let bestMatchLen = 0

  for (const recognized of HIGHLIGHT_NAMES) {
    const recognizedParts = recognized.split('.')
    let matches = true
    for (const part of recognizedParts) {
      if (!captureParts.includes(part)) {
        matches = false
        break
      }
    }
    if (matches && recognizedParts.length > bestMatchLen) {
      bestMatch = recognized
      bestMatchLen = recognizedParts.length
    }
  }

  return bestMatch ?? name
}
