#ifndef TREE_SITTER_CSV_H_
#define TREE_SITTER_CSV_H_

typedef struct TSLanguage TSLanguage;

#ifdef __cplusplus
extern "C" {
#endif

extern TSLanguage *tree_sitter_csv();
extern TSLanguage *tree_sitter_psv();
extern TSLanguage *tree_sitter_tsv();

#ifdef __cplusplus
}
#endif

#endif // TREE_SITTER_CSV_H_
