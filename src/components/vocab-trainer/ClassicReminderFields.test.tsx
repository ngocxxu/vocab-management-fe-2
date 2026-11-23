// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ClassicReminderFields from './ClassicReminderFields';

// Resolve keys against the real English strings, so the test reads the text a user sees.
vi.mock('next-intl', async () => {
  const { default: messages } = await import('@/locales/en.json');
  const translate = (namespace: string) => (key: string, values?: Record<string, number>) => {
    const text = [...namespace.split('.'), ...key.split('.')].reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], messages) as string;
    // Only plain {name} placeholders are filled in; the messages used here have no plural or tag syntax.
    return text.replace(/\{(\w+)\}/g, (_match, name: string) => String(values?.[name] ?? `{${name}}`));
  };
  return { useTranslations: translate };
});

function Harness({ earnedPasses }: Readonly<{ earnedPasses: number }>) {
  const form = useForm({ defaultValues: { reminderSpacingDays: 2, reminderMaxRepeat: 6 } });

  return (
    <FormProvider {...form}>
      <ClassicReminderFields earnedPasses={earnedPasses} />
    </FormProvider>
  );
}

describe('classicReminderFields', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the days between reminders with the allowed range', () => {
    render(<Harness earnedPasses={0} />);

    const spacing = screen.getByLabelText('Days between reminders') as HTMLInputElement;
    expect(spacing.type).toBe('number');
    expect(spacing.min).toBe('2');
    expect(spacing.max).toBe('30');
    expect(spacing.value).toBe('2');
  });

  it('shows the max passes with the allowed range and its starting value', () => {
    render(<Harness earnedPasses={0} />);

    const maxRepeat = screen.getByLabelText('Max passes') as HTMLInputElement;
    expect(maxRepeat.min).toBe('3');
    expect(maxRepeat.max).toBe('20');
    expect(maxRepeat.value).toBe('6');
  });

  it('does not show the earned-passes floor when no pass is earned yet', () => {
    render(<Harness earnedPasses={0} />);

    expect(screen.queryByText(/already earned/)).toBeNull();
  });

  it('raises the lowest allowed max passes to the passes already earned, and says so', () => {
    render(<Harness earnedPasses={4} />);

    expect((screen.getByLabelText('Max passes') as HTMLInputElement).min).toBe('4');
    expect(screen.getByText(/passes already earned: 4/)).toBeTruthy();
  });
});
