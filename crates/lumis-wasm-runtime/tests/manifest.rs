use lumis_wasm_runtime::manifest::{find_language, LANGUAGES, PARSERS};

#[test]
fn resolves_every_language_and_alias_to_its_parser() {
    for language in LANGUAGES {
        assert_eq!(find_language(language.id), Some(language));
        assert_eq!(
            find_language(&language.id.to_ascii_uppercase()),
            Some(language)
        );

        for alias in language.aliases {
            assert_eq!(find_language(alias), Some(language));
        }

        assert!(
            PARSERS
                .iter()
                .any(|parser| std::ptr::eq(parser, language.parser)),
            "{} references a parser outside the manifest",
            language.id
        );
    }
}
