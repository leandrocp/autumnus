import { Root } from 'hast';
import { Theme, LanguageInput, LanguageRef } from '@lumis-sh/lumis';
import { Plugin } from 'unified';

interface RehypeLumisOptions {
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
declare const rehypeLumis: Plugin<[RehypeLumisOptions], Root>;

export { type RehypeLumisOptions, rehypeLumis as default };
