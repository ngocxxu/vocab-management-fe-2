/**
 * Below this, semantic search returns noise: it matches meaning, not characters,
 * so "b" carries no meaning to embed and the model returns near-random neighbours.
 * Substring search already handles short prefixes well, and skipping these saves
 * a Gemini call per stray keystroke.
 */
export const MIN_SEMANTIC_QUERY_LENGTH = 2;

/**
 * Matches SEMANTIC_SEARCH_MAX_QUERY_LENGTH on the backend
 * (vocab.controller.ts). Enforced here too, on the input itself, so an
 * oversized query never reaches the server to be rejected — the backend limit
 * exists to keep the query under the embedding model's token ceiling.
 */
export const MAX_SEMANTIC_QUERY_LENGTH = 1000;
