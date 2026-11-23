// @vitest-environment jsdom
import type { TQuestionAPI } from '@/types/vocab-trainer';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VocabExam from './VocabExam';

const { submitExam, reloadVocabTrainer, answerReminderPrompt, mockUseRouter, routerPush, toastSuccess, toastError } = vi.hoisted(() => ({
  submitExam: vi.fn(),
  mockUseRouter: vi.fn(),
  reloadVocabTrainer: vi.fn(),
  answerReminderPrompt: vi.fn(),
  routerPush: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/actions/vocab-trainers', () => ({ submitExam, reloadVocabTrainer, answerReminderPrompt }));
vi.mock('next/navigation', () => ({ useRouter: mockUseRouter }));
vi.mock('sonner', () => ({ toast: { success: toastSuccess, error: toastError } }));

// The results screen and the question widgets are covered elsewhere. Keep this test on the prompt.
vi.mock('./ExamResults', () => ({ default: () => <div>exam results</div> }));
vi.mock('./VocabExamHeader', () => ({ default: () => null }));
vi.mock('./QuestionCard', () => ({
  default: ({ onAnswerSelect }: { onAnswerSelect: (value: string) => void }) => (
    <button type="button" onClick={() => onAnswerSelect('A')}>pick answer</button>
  ),
}));

// Resolve keys against the real English strings, so the test reads the text a user sees.
vi.mock('next-intl', async () => {
  const { default: messages } = await import('@/locales/en.json');
  const translate = (namespace: string) => (key: string) =>
    [...namespace.split('.'), ...key.split('.')].reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], messages) as string;
  return { useTranslations: translate };
});

const examData = {
  id: 'trainer-1',
  name: 'Verbs',
  questionType: 'MULTIPLE_CHOICE',
  setCountTime: 900,
  questionAnswers: [{ correctAnswer: 'A' }],
} as unknown as TQuestionAPI;

async function submitOneAnswer(questionType = 'MULTIPLE_CHOICE') {
  render(<VocabExam trainerId="trainer-1" examData={{ ...examData, questionType } as unknown as TQuestionAPI} />);
  fireEvent.click(screen.getByRole('button', { name: 'pick answer' }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit Exam' }));
  await waitFor(() => expect(screen.getByText('exam results')).toBeTruthy());
}

describe('vocabExam: reminder question after a multiple-choice submit', () => {
  beforeEach(() => {
    submitExam.mockReset().mockResolvedValue({});
    reloadVocabTrainer.mockReset();
    answerReminderPrompt.mockReset();
    routerPush.mockReset();
    mockUseRouter.mockReset().mockReturnValue({ push: routerPush });
    toastSuccess.mockReset();
    toastError.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('asks the reminder question on the results when the trainer has one pending', async () => {
    reloadVocabTrainer.mockResolvedValue({ kind: 'found', trainer: { id: 'trainer-1', name: 'Verbs', reminderPromptPending: true } });

    await submitOneAnswer();

    expect(await screen.findByRole('heading', { name: 'Keep reminders on?' })).toBeTruthy();
    expect(reloadVocabTrainer).toHaveBeenCalledWith('trainer-1');
  });

  it('asks the reminder question after a fill-in-blank-choice submit too', async () => {
    reloadVocabTrainer.mockResolvedValue({ kind: 'found', trainer: { id: 'trainer-1', name: 'Verbs', reminderPromptPending: true } });

    await submitOneAnswer('FILL_IN_BLANK_CHOICE');

    expect(await screen.findByRole('heading', { name: 'Keep reminders on?' })).toBeTruthy();
  });

  it('does not ask when no reminder question is pending', async () => {
    reloadVocabTrainer.mockResolvedValue({ kind: 'found', trainer: { id: 'trainer-1', name: 'Verbs', reminderPromptPending: false } });

    await submitOneAnswer();

    await waitFor(() => expect(reloadVocabTrainer).toHaveBeenCalledWith('trainer-1'));
    expect(screen.queryByRole('heading', { name: 'Keep reminders on?' })).toBeNull();
  });

  it('keeps the results and does not redirect when the submit completed the trainer', async () => {
    reloadVocabTrainer.mockResolvedValue({ kind: 'gone' });

    await submitOneAnswer();

    await waitFor(() => expect(reloadVocabTrainer).toHaveBeenCalledWith('trainer-1'));
    expect(screen.queryByRole('heading', { name: 'Keep reminders on?' })).toBeNull();
    expect(routerPush).not.toHaveBeenCalled();
  });
});
