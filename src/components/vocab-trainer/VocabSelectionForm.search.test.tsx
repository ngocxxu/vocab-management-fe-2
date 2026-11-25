// @vitest-environment jsdom
import type { TVocab } from '@/types/vocab-list';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VocabSelectionForm from './VocabSelectionForm';

const { getVocabsForSelection, getRandomVocabsForSelection, getMyLanguageFoldersForSelection } = vi.hoisted(() => ({
  getVocabsForSelection: vi.fn(),
  getRandomVocabsForSelection: vi.fn(),
  getMyLanguageFoldersForSelection: vi.fn(),
}));

// The app runs these as server actions. The test mocks them and reads the query they receive.
vi.mock('@/actions', () => ({ getVocabsForSelection, getRandomVocabsForSelection }));
vi.mock('@/actions/language-folders', () => ({ getMyLanguageFoldersForSelection }));

// Resolve keys against the real English strings, so the test reads the text a user sees.
vi.mock('next-intl', async () => {
  const { default: messages } = await import('@/locales/en.json');
  const translate = (namespace: string) => (key: string, values?: Record<string, number>) => {
    const text = [...namespace.split('.'), ...key.split('.')].reduce<unknown>(
      (node, part) => (node as Record<string, unknown> | undefined)?.[part],
      messages,
    );
    // Keys this test does not read fall back to the key itself, so an unrelated label cannot break the render.
    if (typeof text !== 'string') {
      return key;
    }
    return text.replace(/\{(\w+)\}/g, (_match, name: string) => String(values?.[name] ?? `{${name}}`));
  };
  return { useTranslations: translate };
});

const SEARCH_PLACEHOLDER = 'Search across all folders...';
const EMPTY_PAGE = { items: [], totalItems: 0, totalPages: 0, currentPage: 1 };
const SAVED_VOCAB = {
  id: 'vocab-1',
  textSource: 'apple',
  sourceLanguageCode: 'en',
  targetLanguageCode: 'th',
  textTargets: [],
  masteryScore: 0,
} as unknown as TVocab;
const NO_IDS: string[] = [];
const NO_VOCABS: Record<string, TVocab> = {};
const SAVED_IDS = ['vocab-1'];
const SAVED_VOCABS: Record<string, TVocab> = { 'vocab-1': SAVED_VOCAB };

type HarnessProps = Readonly<{
  editMode?: boolean;
  selectedIds?: string[];
  selectedVocabById?: Record<string, TVocab>;
}>;

function Harness({ editMode = false, selectedIds = NO_IDS, selectedVocabById = NO_VOCABS }: HarnessProps) {
  const form = useForm({ defaultValues: { vocabAssignmentIds: selectedIds } });

  return (
    <FormProvider {...form}>
      <VocabSelectionForm selectedIds={selectedIds} selectedVocabById={selectedVocabById} editMode={editMode} />
    </FormProvider>
  );
}

// The search text the most recent vocab query was sent with.
function lastQueryText(): string | undefined {
  return (getVocabsForSelection.mock.lastCall?.[0] as { textSource?: string } | undefined)?.textSource;
}

function getSearchField(): HTMLInputElement {
  return screen.getByPlaceholderText(SEARCH_PLACEHOLDER) as HTMLInputElement;
}

describe('vocabSelectionForm: search field', () => {
  beforeEach(() => {
    getVocabsForSelection.mockReset().mockResolvedValue(EMPTY_PAGE);
    getRandomVocabsForSelection.mockReset();
    getMyLanguageFoldersForSelection.mockReset().mockResolvedValue({ items: [] });
  });

  afterEach(() => {
    cleanup();
  });

  it('keeps the typed text visible in the search field', async () => {
    render(<Harness />);

    fireEvent.change(getSearchField(), { target: { value: 'hello' } });

    expect(getSearchField().value).toBe('hello');
    await waitFor(() => expect(lastQueryText()).toBe('hello'));
    expect(getSearchField().value).toBe('hello');
  });

  it('sends the typed text to the vocab query, and clears it when the field is emptied', async () => {
    render(<Harness />);

    fireEvent.change(getSearchField(), { target: { value: 'hel' } });
    fireEvent.change(getSearchField(), { target: { value: 'hello' } });
    expect(getSearchField().value).toBe('hello');
    await waitFor(() => expect(lastQueryText()).toBe('hello'));

    fireEvent.change(getSearchField(), { target: { value: '' } });
    expect(getSearchField().value).toBe('');
    await waitFor(() => expect(lastQueryText()).toBeUndefined());
  });

  it('keeps the typed text visible in edit mode', async () => {
    render(<Harness editMode selectedIds={SAVED_IDS} selectedVocabById={SAVED_VOCABS} />);

    fireEvent.change(getSearchField(), { target: { value: 'hello' } });

    expect(getSearchField().value).toBe('hello');
    await waitFor(() => expect(lastQueryText()).toBe('hello'));
    expect(getSearchField().value).toBe('hello');
  });
});
