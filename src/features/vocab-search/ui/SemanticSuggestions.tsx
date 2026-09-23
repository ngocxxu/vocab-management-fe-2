import type { TVocab } from '@/types/vocab-list';
import Link from 'next/link';
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';

const SUGGESTION_LIMIT = 6;

type SemanticSuggestionsProps = {
  /**
   * Already fetched server-side (getVocabListPageData), gated on
   * MIN_SEMANTIC_QUERY_LENGTH there — `undefined` in the caller means "not
   * fetched this render" (short/empty query), never "fetched, zero results".
   */
  vocabs: TVocab[];
  /** Vocab ids already visible in the table, so the same word is not shown twice. */
  excludeIds: string[];
  /** Only used to build the "search across all folders" link, not to fetch. */
  query: string;
};

function SuggestionRow({ vocab }: { vocab: TVocab }) {
  const targets = vocab.textTargets.map(target => target.textTarget).filter(Boolean).join(', ');

  return (
    <Link
      href={`/vocab-list/${vocab.id}`}
      className="flex items-baseline gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/60"
    >
      <span className="font-medium text-foreground">{vocab.textSource}</span>
      {targets && <span className="truncate text-sm text-muted-foreground">{targets}</span>}
    </Link>
  );
}

/**
 * Meaning-based matches shown BELOW the exact/substring table, never replacing it.
 *
 * Two lists rather than one merged ranking: exact matches must stay on top, and
 * semantic results have no finite result set to paginate — every vocab has some
 * similarity score, so page 5 is just increasingly unrelated words.
 *
 * Purely presentational — no fetch, no loading state. The data already exists
 * by the time this renders (Server Component fetch, resolved before paint),
 * and there is no client-side route to the backend for this to call anyway.
 */
const SemanticSuggestions: React.FC<SemanticSuggestionsProps> = ({ vocabs, excludeIds, query }) => {
  const excluded = new Set(excludeIds);
  const suggestions = vocabs.filter(vocab => !excluded.has(vocab.id)).slice(0, SUGGESTION_LIMIT);

  // Errors stay silent: this supplements a table that already has its own results,
  // so an outage here should not put an error banner on an otherwise working page.
  // getVocabListPageData already swallows this call's failure into `undefined`.
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">Related by meaning</h3>
          <span className="text-xs text-muted-foreground">Matched by meaning, not spelling</span>
        </div>

        <div className="flex flex-col">
          {suggestions.map(vocab => <SuggestionRow key={vocab.id} vocab={vocab} />)}
        </div>

        <Link
          href={`/search?q=${encodeURIComponent(query.trim())}`}
          className="mt-3 inline-block px-3 text-sm text-primary hover:underline"
        >
          Search across all folders
        </Link>
      </CardContent>
    </Card>
  );
};

export default SemanticSuggestions;
