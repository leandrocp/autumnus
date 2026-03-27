import MarkdownIt from 'markdown-it';
import { Theme, LanguageInput, LanguageRef, Highlighter } from '@lumis-sh/lumis';

interface MarkdownItLumisOptions {
    theme: Theme;
    langs?: LanguageInput[];
    loadLanguages?: Array<LanguageRef>;
    defaultLanguage?: LanguageRef;
    fallbackLanguage?: LanguageRef;
    preClass?: string;
    detectLanguage?: boolean;
    includeHighlights?: boolean;
    italic?: boolean;
    onError?: (error: unknown, context: {
        language?: string;
        code: string;
    }) => void;
}
declare function fromHighlighter(highlighter: Highlighter, options: MarkdownItLumisOptions): (md: MarkdownIt) => void;
declare function markdownItLumis(options: MarkdownItLumisOptions): Promise<(md: MarkdownIt) => void>;

export { type MarkdownItLumisOptions, markdownItLumis as default, fromHighlighter };
