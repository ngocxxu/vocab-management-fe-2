'use client';

import type { TVocabSearchGroup } from '@/types/vocab-search';
import { CloseCircle, Magnifer } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useTransition } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Card, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { MAX_SEMANTIC_QUERY_LENGTH, MIN_SEMANTIC_QUERY_LENGTH } from '../constants';

/** Matches DataTable's SEARCH_DEBOUNCE_MS — one embedding call per settled query, not per keystroke. */
const SEARCH_DEBOUNCE_MS = 1000;

type GlobalVocabSearchProps = {
  initialQuery: string;
  /** Fetched server-side (page.tsx) for `initialQuery` — this component never fetches itself. */
  initialGroups: TVocabSearchGroup[];
  /** True when the server-side fetch itself broke — distinct from "fetched, genuinely zero matches". */
  failed: boolean;
};

/**
 * Folder name plus language pair, e.g. "IT · EN → VI" — read off the group's
 * own rows, not a second lookup. Falls back to the pair alone when the folder
 * was deleted or the name lookup failed (`languageFolderName` is then null).
 */
function groupLabel(group: TVocabSearchGroup): { name: string | null; pair: string | null } {
  const first = group.vocabs[0];
  const pair = first ? `${first.sourceLanguageCode.toUpperCase()} → ${first.targetLanguageCode.toUpperCase()}` : null;
  return { name: group.languageFolderName, pair };
}

function GroupSection({ group, query }: { group: TVocabSearchGroup; query: string }) {
  const first = group.vocabs[0];
  const { name, pair } = groupLabel(group);

  // languageFolderId alone is not enough: a user can have multiple folders on
  // the same language pair (e.g. "IT" and "Travel", both EN→VI), so the id
  // still filters to the right one — but VocabListHeader's language badge
  // reads source/targetLanguageCode straight from the URL, not from the
  // folder, so both have to be passed for the header to render correctly.
  const viewAllHref = first
    ? `/vocab-list?languageFolderId=${encodeURIComponent(group.languageFolderId)}&sourceLanguageCode=${encodeURIComponent(first.sourceLanguageCode)}&targetLanguageCode=${encodeURIComponent(first.targetLanguageCode)}&textSource=${encodeURIComponent(query)}`
    : `/vocab-list?languageFolderId=${encodeURIComponent(group.languageFolderId)}&textSource=${encodeURIComponent(query)}`;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {/*
              Language pair shown alongside the folder name, not instead of it —
              results span every folder, so the name alone still leaves the
              reader guessing which languages a folder like "IT" actually holds.
            */}
            <h3 className="text-sm font-semibold text-foreground">{name ?? pair ?? 'Folder'}</h3>
            {name && pair && <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{pair}</span>}
          </div>
          <Link href={viewAllHref} className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="flex flex-col">
          {group.vocabs.map((vocab) => {
            const targets = vocab.textTargets.map(target => target.textTarget).filter(Boolean).join(', ');
            return (
              <Link
                key={vocab.id}
                href={`/vocab-list/${vocab.id}`}
                className="flex items-baseline gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/60"
              >
                <span className="font-medium text-foreground">{vocab.textSource}</span>
                {targets && <span className="truncate text-sm text-muted-foreground">{targets}</span>}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Cross-folder semantic search.
 *
 * Results arrive grouped per folder and are rendered that way rather than merged
 * into one ranking: multilingual embeddings score same-language and English
 * matches higher, so a single list would hand most slots to whichever folder
 * shares a language with the query, burying equally good matches elsewhere.
 *
 * This component only holds the input and its debounce. The actual search runs
 * server-side (page.tsx re-fetches on the URL `q` param change) — this pushes
 * the URL after the user stops typing, the same way VocabList's own search does,
 * and renders whatever `initialGroups` the Server Component fetched for it.
 */
const GlobalVocabSearch: React.FC<GlobalVocabSearchProps> = ({ initialQuery, initialGroups, failed }) => {
  const router = useRouter();
  const [input, setInput] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(input, SEARCH_DEBOUNCE_MS);
  // Tracks the router.replace navigation, not the debounce delay — the two are
  // sequential (debounce settles, THEN navigation starts), so this only covers
  // the gap the debounce itself gives no feedback for.
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    // Equal means this value came FROM the server render (initialQuery), so
    // navigating again would be a redundant no-op fetch.
    if (trimmed === initialQuery.trim()) {
      return;
    }
    const next = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search';
    startTransition(() => {
      router.replace(next, { scroll: false });
    });
  }, [debouncedQuery, initialQuery, router]);

  const trimmedInput = input.trim();
  const isTooShort = trimmedInput.length > 0 && trimmedInput.length < MIN_SEMANTIC_QUERY_LENGTH;
  const hasQueriedLength = initialQuery.trim().length >= MIN_SEMANTIC_QUERY_LENGTH;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Search by meaning</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search across every folder and language. Type &ldquo;cat&rdquo; to also find &ldquo;mèo&rdquo;, &ldquo;猫&rdquo;, &ldquo;chat&rdquo;.
        </p>
      </div>

      <div className="relative flex items-center rounded-full border border-border bg-muted">
        <Magnifer size={18} weight="BoldDuotone" className="ml-4 shrink-0 text-muted-foreground" />
        <Input
          value={input}
          onChange={event => setInput(event.target.value)}
          maxLength={MAX_SEMANTIC_QUERY_LENGTH}
          placeholder="Type a word or meaning..."
          aria-label="Search vocab by meaning"
          className="h-12 flex-1 border-0 bg-transparent pr-4 pl-3 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {input.length > 0 && (
          <button
            type="button"
            onClick={() => setInput('')}
            aria-label="Clear search"
            className="mr-3 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <CloseCircle size={18} weight="BoldDuotone" />
          </button>
        )}
      </div>

      {/* Debounce itself is silent by design (no flicker while typing); this covers only the gap after it settles, while the new URL is loading. */}
      {isPending && <p className="text-sm text-muted-foreground">Searching…</p>}

      {!isPending && isTooShort && (
        <p className="text-sm text-muted-foreground">
          Type at least
          {' '}
          {MIN_SEMANTIC_QUERY_LENGTH}
          {' '}
          characters — a shorter query carries no meaning to search on.
        </p>
      )}

      {!isPending && !isTooShort && trimmedInput.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Type a word, phrase, or meaning above — matches come from every folder and language, not just what you typed.
        </p>
      )}

      {!isPending && !isTooShort && failed && (
        <p className="text-sm text-destructive">Search failed. Try again in a moment.</p>
      )}

      {!isPending && !isTooShort && !failed && hasQueriedLength && initialGroups.length === 0 && (
        <p className="text-sm text-muted-foreground">No related words found.</p>
      )}

      {!isPending && initialGroups.length > 0 && (
        <div className="flex flex-col gap-4">
          {initialGroups.map(group => (
            <GroupSection key={group.languageFolderId} group={group} query={initialQuery.trim()} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalVocabSearch;
