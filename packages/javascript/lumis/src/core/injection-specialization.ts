export interface SpecializedInjections {
  source: string;
  omittedLanguages: Set<string>;
}

function skipWhitespaceAndComments(source: string, start: number): number {
  let index = start;
  while (index < source.length) {
    if (/\s/.test(source[index]!)) {
      index += 1;
      continue;
    }
    if (source[index] === ";") {
      const newline = source.indexOf("\n", index);
      return newline === -1 ? source.length : skipWhitespaceAndComments(source, newline + 1);
    }
    break;
  }
  return index;
}

function balancedExpressionEnd(source: string, start: number): number {
  let depth = 0;
  let inString = false;
  let escaped = false;
  let inComment = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index]!;
    if (inComment) {
      if (char === "\n") inComment = false;
      continue;
    }
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === ";") {
      inComment = true;
    } else if (char === '"') {
      inString = true;
    } else if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }

  return source.length;
}

function splitPatterns(source: string): string[] {
  const patterns: string[] = [];
  let index = 0;

  while (index < source.length) {
    index = skipWhitespaceAndComments(source, index);
    if (index >= source.length) break;
    if (source[index] !== "(") {
      const newline = source.indexOf("\n", index);
      index = newline === -1 ? source.length : newline + 1;
      continue;
    }

    const start = index;
    let end = balancedExpressionEnd(source, start);
    let trailing = skipWhitespaceAndComments(source, end);

    // Tree-sitter permits captures and predicate expressions after a root
    // expression. Keep those attached to the same pattern.
    while (trailing < source.length) {
      if (source[trailing] === "@" || source[trailing] === ".") {
        const tokenEnd = source.slice(trailing).search(/\s/);
        end = tokenEnd === -1 ? source.length : trailing + tokenEnd;
        trailing = skipWhitespaceAndComments(source, end);
        continue;
      }
      if (source.startsWith("(#", trailing)) {
        end = balancedExpressionEnd(source, trailing);
        trailing = skipWhitespaceAndComments(source, end);
        continue;
      }
      break;
    }

    patterns.push(source.slice(start, end));
    index = end;
  }

  return patterns;
}

function staticInjectionLanguages(pattern: string): string[] {
  return Array.from(
    pattern.matchAll(/#set!\s+injection\.language\s+"([^"\\]*)"/g),
    (match) => match[1]!,
  );
}

/**
 * Remove static injection patterns whose target language cannot be used by
 * this highlighter. Dynamic, self, and parent injections remain intact.
 */
export function specializeInjections(
  source: string,
  isLanguageAvailable: (language: string) => boolean,
): SpecializedInjections {
  if (!source.trim()) return { source: "", omittedLanguages: new Set() };

  const kept: string[] = [];
  const omittedLanguages = new Set<string>();

  for (const pattern of splitPatterns(source)) {
    const targets = staticInjectionLanguages(pattern);
    const isDynamic = pattern.includes("@injection.language");
    const isRelative = pattern.includes("injection.self") || pattern.includes("injection.parent");
    if (targets.length === 0 || isDynamic || isRelative || targets.some(isLanguageAvailable)) {
      kept.push(pattern);
      continue;
    }

    for (const target of targets) omittedLanguages.add(target);
  }

  return { source: kept.join("\n"), omittedLanguages };
}
