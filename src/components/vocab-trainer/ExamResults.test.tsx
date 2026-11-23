// @vitest-environment jsdom
import type { ExamResultsProps, TExamResult, TExamResultsQuestion } from '@/types/vocab-trainer';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ExamResults from './ExamResults';

// Resolve keys against the real English strings, so the test reads the text a user sees.
vi.mock('next-intl', async () => {
  const { default: messages } = await import('@/locales/en.json');
  const translate = (key: string, values: Record<string, string | number> = {}) => {
    const raw = key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], messages);
    const text = typeof raw === 'string' ? raw : key;
    return text.replace(/\{(\w+)\}/g, (_match, name: string) => String(values[name] ?? `{${name}}`));
  };
  const translator = () => translate;
  const locale = () => 'en';
  return { useTranslations: translator, useLocale: locale };
});

const passedRow: TExamResult = { status: 'PASSED', userSelected: 'cat', systemSelected: 'cat' };
const failedRow: TExamResult = { status: 'FAILED', userSelected: 'dog', systemSelected: 'cat' };

const renderResults = (questions: TExamResultsQuestion[], rows: TExamResult[], timeElapsed: number | null) => {
  const props: ExamResultsProps = {
    trainerId: 'trainer-1',
    results: { status: 'completed', results: rows },
    questions,
    selectedAnswers: new Map(),
    timeElapsed,
    onBackToTrainers: vi.fn(),
  };
  return render(<ExamResults {...props} />);
};

describe('exam results question text', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the stored question text of a row', () => {
    renderResults([{ id: 'q1', content: 'The ___ sat on the mat.', correctAnswer: 'cat' }], [passedRow], 60);

    expect(screen.getByText('The ___ sat on the mat.')).toBeTruthy();
  });

  it('shows a fallback instead of a question when the row has no stored text, and keeps the answers', () => {
    renderResults([{ id: 'q1', content: null, correctAnswer: 'cat' }], [failedRow], 60);

    expect(screen.getByText('Question text was not saved for this result.')).toBeTruthy();
    expect(screen.getByText('dog')).toBeTruthy();
    expect(screen.getByText('cat', { selector: 'div' })).toBeTruthy();
  });

  it('shows a dash for duration and the average when the exam time is not known', () => {
    renderResults([{ id: 'q1', content: 'The ___ sat.', correctAnswer: 'cat' }], [passedRow], null);

    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByText('AVG. — PER QUESTION')).toBeTruthy();
  });
});
