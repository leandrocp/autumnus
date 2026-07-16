use super::Language;
use std::sync::LazyLock;
use streaming_iterator::StreamingIterator;
use tree_sitter::{Parser, Query, QueryCursor, QueryPredicateArg};

struct ContentDetectorSpec {
    language: Language,
    parser: fn() -> tree_sitter::Language,
    query: &'static str,
}

include!(concat!(env!("OUT_DIR"), "/guess_queries.rs"));

struct ContentDetector {
    language: Language,
    parser: fn() -> tree_sitter::Language,
    query: Query,
}

struct DetectionMatch {
    language: Language,
    supersedes: Vec<String>,
}

static CONTENT_DETECTORS: LazyLock<Vec<ContentDetector>> = LazyLock::new(|| {
    CONTENT_DETECTOR_SPECS
        .iter()
        .map(|spec| {
            let query = Query::new(&(spec.parser)(), spec.query).unwrap_or_else(|error| {
                panic!("invalid guess query for {}: {error}", spec.language)
            });
            ContentDetector {
                language: spec.language,
                parser: spec.parser,
                query,
            }
        })
        .collect()
});

pub(super) fn from_content(source: &str) -> Option<Language> {
    if source.is_empty() {
        return None;
    }

    let mut parser = Parser::new();
    let matches = CONTENT_DETECTORS
        .iter()
        .filter_map(|detector| detector.detect(source, &mut parser))
        .collect::<Vec<_>>();

    resolve_matches(&matches)
}

fn resolve_matches(matches: &[DetectionMatch]) -> Option<Language> {
    if let [detected] = matches {
        return Some(detected.language);
    }

    let mut winners = matches.iter().filter(|candidate| {
        matches.iter().all(|other| {
            candidate.language == other.language
                || candidate
                    .supersedes
                    .iter()
                    .any(|id| id == other.language.id_name())
        })
    });
    let winner = winners.next()?;
    winners.next().is_none().then_some(winner.language)
}

impl ContentDetector {
    fn detect(&self, source: &str, parser: &mut Parser) -> Option<DetectionMatch> {
        if parser.set_language(&(self.parser)()).is_err() {
            return None;
        }
        let tree = parser.parse(source, None)?;

        let source_bytes = source.as_bytes();
        let mut cursor = QueryCursor::new();
        let mut matches = cursor.matches(&self.query, tree.root_node(), source_bytes);

        while let Some(query_match) = matches.next() {
            let predicates_match = self
                .query
                .general_predicates(query_match.pattern_index)
                .iter()
                .all(|predicate| match (predicate.operator.as_ref(), predicate.args.as_ref()) {
                    (
                        "eq-trimmed?",
                        [QueryPredicateArg::Capture(capture), QueryPredicateArg::String(expected)],
                    ) => query_match.captures.iter().any(|candidate| {
                        candidate.index == *capture
                            && candidate
                                .node
                                .utf8_text(source_bytes)
                                .is_ok_and(|actual| actual.trim() == expected.as_ref())
                    }),
                    (operator, _) => panic!(
                        "unsupported predicate `{operator}` in guess query for {}",
                        self.language
                    ),
                });

            if predicates_match {
                let supersedes = self
                    .query
                    .property_settings(query_match.pattern_index)
                    .iter()
                    .filter(|property| property.key.as_ref() == "guess.supersedes")
                    .filter_map(|property| property.value.as_deref())
                    .flat_map(|value| value.split(','))
                    .map(str::trim)
                    .filter(|value| !value.is_empty())
                    .map(str::to_owned)
                    .collect();
                return Some(DetectionMatch {
                    language: self.language,
                    supersedes,
                });
            }
        }

        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn all_enabled_guess_queries_compile() {
        assert_eq!(CONTENT_DETECTORS.len(), CONTENT_DETECTOR_SPECS.len());
    }

    #[cfg(all(feature = "lang-elixir", feature = "lang-rust"))]
    #[test]
    fn unrelated_matches_abstain() {
        let matches = [
            DetectionMatch {
                language: Language::Elixir,
                supersedes: Vec::new(),
            },
            DetectionMatch {
                language: Language::Rust,
                supersedes: Vec::new(),
            },
        ];
        assert_eq!(resolve_matches(&matches), None);
    }

    #[cfg(all(
        feature = "lang-javascript",
        feature = "lang-typescript",
        feature = "lang-tsx"
    ))]
    #[test]
    fn explicit_specificity_resolves_language_family_matches() {
        let matches = [
            DetectionMatch {
                language: Language::JavaScript,
                supersedes: Vec::new(),
            },
            DetectionMatch {
                language: Language::TypeScript,
                supersedes: vec!["javascript".to_string()],
            },
            DetectionMatch {
                language: Language::Tsx,
                supersedes: vec!["javascript".to_string(), "typescript".to_string()],
            },
        ];
        assert_eq!(resolve_matches(&matches), Some(Language::Tsx));
    }
}
