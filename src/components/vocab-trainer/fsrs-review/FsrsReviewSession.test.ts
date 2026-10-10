// @vitest-environment jsdom
import type { TFsrsQueueItem } from '@/types/vocab-trainer';
import { act, createElement } from 'react';
// @ts-expect-error -- @types/react-dom is not installed; drop this line if it ever is
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EFsrsDirection, EFsrsState, EQuestionType } from '@/enum/vocab-trainer';
import FsrsReviewSession from './FsrsReviewSession';

const { submitReviewAnswer, checkReviewAnswer, toastError } = vi.hoisted(() => ({
  submitReviewAnswer: vi.fn(),
  checkReviewAnswer: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/actions/vocab-trainers', () => ({ submitReviewAnswer, checkReviewAnswer }));
vi.mock('sonner', () => ({ toast: { error: toastError, info: vi.fn() } }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const button = (days: number) => ({ due: '2026-10-05T00:00:00.000Z', scheduledDays: days });

function makeItem(overrides: Partial<TFsrsQueueItem> = {}): TFsrsQueueItem {
  return {
    cardId: 'card-1',
    vocabId: 'vocab-1',
    direction: EFsrsDirection.SOURCE_TO_TARGET,
    state: EFsrsState.REVIEW,
    isNew: false,
    frontText: ['apple'],
    acceptedAnswers: ['quả táo', 'táo'],
    frontLanguageCode: 'en',
    backLanguageCode: 'vi',
    preview: { AGAIN: button(1), HARD: button(3), GOOD: button(8), EASY: button(21) },
    ...overrides,
  };
}

let container: HTMLDivElement;
let unmount: () => void;

async function mount(items: TFsrsQueueItem[], questionType: EQuestionType.FLIP_CARD | EQuestionType.FILL_IN_THE_BLANK = EQuestionType.FLIP_CARD) {
  container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  unmount = () => root.unmount();
  await act(async () => {
    root.render(createElement(FsrsReviewSession, {
      trainerId: 'trainer-1',
      questionType,
      items,
      pendingAfter: 0,
      moreCount: 0,
      isLoadingMore: false,
      onMore: vi.fn(),
      onStop: vi.fn(),
      onEnded: vi.fn(),
    }));
  });
}

const byLabel = (prefix: string) => container.querySelector<HTMLButtonElement>(`button[aria-label^="${prefix}"]`);
const byText = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent?.includes(text));

async function pressKey(key: string) {
  await act(async () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  });
}

async function click(element: Element | null | undefined) {
  await act(async () => {
    element?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('fsrsReviewSession', () => {
  beforeEach(() => {
    submitReviewAnswer.mockReset();
    checkReviewAnswer.mockReset();
    toastError.mockReset();
    submitReviewAnswer.mockResolvedValue({ ended: false, result: {} });
  });

  afterEach(() => {
    act(() => unmount());
    container.remove();
  });

  it('asks the word and accepts the meaning when the direction is Word → Meaning', async () => {
    await mount([makeItem()]);

    expect(container.textContent).toContain('Word → Meaning');
    expect(container.textContent).toContain('apple');
    expect(container.textContent).toContain('quả táo, táo');
  });

  it('asks the meaning when the direction is Meaning → Word', async () => {
    await mount([makeItem({ direction: EFsrsDirection.TARGET_TO_SOURCE, frontText: ['quả táo'], acceptedAnswers: ['apple'], frontLanguageCode: 'vi', backLanguageCode: 'en' })]);

    expect(container.textContent).toContain('Meaning → Word');
    expect(container.querySelector('h2')?.textContent).toBe('quả táo');
  });

  it('shows the next interval on every button once the answer is shown', async () => {
    await mount([makeItem()]);
    await pressKey(' ');

    expect(['Again', 'Hard', 'Good', 'Easy'].map(name => byLabel(name)?.getAttribute('aria-label'))).toEqual([
      'Again, comes back in 1d',
      'Hard, comes back in 3d',
      'Good, comes back in 8d',
      'Easy, comes back in 21d',
    ]);
  });

  it('records one review for a double click', async () => {
    submitReviewAnswer.mockReturnValue(new Promise(resolve => setTimeout(() => resolve({ ended: false, result: {} }), 20)));
    await mount([makeItem()]);
    await pressKey(' ');

    await act(async () => {
      byLabel('Good')?.click();
      byLabel('Good')?.click();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }));
    });

    expect(submitReviewAnswer).toHaveBeenCalledTimes(1);
    expect(submitReviewAnswer).toHaveBeenCalledWith('trainer-1', expect.objectContaining({ cardId: 'card-1', rating: 'GOOD', questionType: EQuestionType.FLIP_CARD }));
  });

  it('rates with the keys 1-4 only after the answer is shown', async () => {
    await mount([makeItem()]);
    await pressKey('1');
    expect(submitReviewAnswer).not.toHaveBeenCalled();

    await pressKey(' ');
    await pressKey('4');

    expect(submitReviewAnswer).toHaveBeenCalledWith('trainer-1', expect.objectContaining({ rating: 'EASY' }));
  });

  it('sends the same answer id when a failed request is tried again', async () => {
    submitReviewAnswer.mockRejectedValueOnce(new Error('Network down'));
    await mount([makeItem()]);
    await pressKey(' ');

    await click(byLabel('Good'));
    await click(byLabel('Good'));

    expect(submitReviewAnswer).toHaveBeenCalledTimes(2);
    const [first, second] = submitReviewAnswer.mock.calls.map(call => call[1].answerId);
    expect(first).toBe(second);
    expect(toastError).toHaveBeenCalledTimes(1);
  });

  it('does not record the retry round', async () => {
    await mount([makeItem()]);
    await pressKey(' ');
    await click(byLabel('Again'));
    expect(submitReviewAnswer).toHaveBeenCalledTimes(1);

    await click(byText('Retry 1 missed'));
    await pressKey(' ');
    await click(byText('Got it'));

    expect(submitReviewAnswer).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('remembered 1 of 1');
    expect(container.textContent).toContain('was not saved');
  });

  it('checks a typed answer and highlights the suggested button', async () => {
    checkReviewAnswer.mockResolvedValue({ correctAnswers: ['quả táo', 'táo'], diff: [{ type: 'same', text: 'táo' }], suggestedRating: 'GOOD' });
    await mount([makeItem()], EQuestionType.FILL_IN_THE_BLANK);

    const input = container.querySelector('input') as HTMLInputElement;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, 'táo');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await click(byText('Check'));

    expect(checkReviewAnswer).toHaveBeenCalledWith('trainer-1', 'card-1', 'táo');
    expect(container.textContent).toContain('Accepted: quả táo, táo');
    expect(byLabel('Good')?.getAttribute('aria-label')).toContain('suggested');
  });
});
