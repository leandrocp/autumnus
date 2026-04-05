#[cfg(all(
    feature = "bundle-web",
    feature = "lang-rust",
    feature = "lang-javascript"
))]
mod tests {
    use lumis::languages::{available_languages, Language};

    #[test]
    fn bundle_languages_are_available_alongside_direct_language_features() {
        let languages = available_languages();

        assert!(languages.contains_key("html"));
        assert!(languages.contains_key("javascript"));
        assert!(languages.contains_key("rust"));
    }

    #[test]
    fn html_guessing_works_when_html_is_only_enabled_via_bundle() {
        let src = "<!DOCTYPE html>\n<html><body>Hello</body></html>";

        assert_eq!(Language::guess(None, src), Language::HTML);
        assert_eq!(
            Language::guess(Some("main.rs"), "fn main() {}"),
            Language::Rust
        );
        assert_eq!(
            Language::guess(Some("main.js"), "const x = 1;"),
            Language::JavaScript
        );
    }
}
