// @vitest-environment jsdom
import type { TVocabTrainer } from '@/types/vocab-trainer';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ReminderPromptDialog from './ReminderPromptDialog';

const { answerReminderPrompt, toastError, toastSuccess } = vi.hoisted(() => ({
  answerReminderPrompt: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('@/actions/vocab-trainers', () => ({ answerReminderPrompt }));
vi.mock('sonner', () => ({ toast: { error: toastError, success: toastSuccess } }));

// Resolve keys against the real English strings, so the test reads the text a user sees.
vi.mock('next-intl', async () => {
  const { default: messages } = await import('@/locales/en.json');
  const translate = (namespace: string) => (key: string, values: Record<string, string | number> = {}) => {
    const raw = [...namespace.split('.'), ...key.split('.')].reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], messages) as string;
    return raw.replace(/\{(\w+)\}/g, (_match, name: string) => String(values[name] ?? `{${name}}`));
  };
  return { useTranslations: translate };
});

const trainer = { id: 'trainer-1', name: 'Verbs', reminderPromptPending: true } as unknown as TVocabTrainer;

function renderDialog(onAnswered = vi.fn(), onOpenChange = vi.fn()) {
  render(<ReminderPromptDialog trainer={trainer} open onOpenChange={onOpenChange} onAnswered={onAnswered} />);
  return { onAnswered, onOpenChange };
}

describe('reminderPromptDialog', () => {
  beforeEach(() => {
    answerReminderPrompt.mockReset();
    toastError.mockReset();
    toastSuccess.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('asks whether to keep reminders on, with a Yes and a No answer', () => {
    renderDialog();

    expect(screen.getByRole('heading', { name: 'Keep reminders on?' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Yes, keep reminders on' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'No, turn reminders off' })).toBeTruthy();
  });

  it('names the fail streak the trainer is set to, not a fixed number', () => {
    render(<ReminderPromptDialog trainer={{ ...trainer, reminderFailStreakForPrompt: 4 } as TVocabTrainer} open onOpenChange={vi.fn()} onAnswered={vi.fn()} />);

    expect(screen.getByText(/you failed the last 4 attempts in a row/)).toBeTruthy();
  });

  it('sends continueReminders true on Yes and reports the trainer the backend returns', async () => {
    const updated = { ...trainer, reminderPromptPending: false } as TVocabTrainer;
    answerReminderPrompt.mockResolvedValue(updated);
    const { onAnswered } = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Yes, keep reminders on' }));

    await waitFor(() => expect(onAnswered).toHaveBeenCalledWith(updated));
    expect(answerReminderPrompt).toHaveBeenCalledWith('trainer-1', true);
  });

  it('sends continueReminders false on No', async () => {
    answerReminderPrompt.mockResolvedValue({ ...trainer, reminderPromptPending: false });
    const { onOpenChange } = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'No, turn reminders off' }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(answerReminderPrompt).toHaveBeenCalledWith('trainer-1', false);
  });

  it('keeps the question open and shows an error when saving fails', async () => {
    answerReminderPrompt.mockRejectedValue(new Error('Server error'));
    const { onAnswered, onOpenChange } = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Yes, keep reminders on' }));

    await waitFor(() => expect(toastError).toHaveBeenCalled());
    expect(onAnswered).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
