// @vitest-environment jsdom
import en from '@/locales/en.json';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LogoDownload } from './LogoDownload';

// Resolve keys against the real English strings, so the tests read the text a user sees.
vi.mock('next-intl', async () => {
  const { default: messages } = await import('@/locales/en.json');
  const translate = (namespace: string) => (key: string) =>
    [...namespace.split('.'), ...key.split('.')].reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], messages) as string;
  return { useTranslations: translate };
});

const { logo } = en.connectAi;

describe('logo download', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows a preview of the light logo and of the dark logo', () => {
    render(<LogoDownload />);

    expect(screen.getByRole('img', { name: logo.light.alt })).toBeTruthy();
    expect(screen.getByRole('img', { name: logo.dark.alt })).toBeTruthy();
  });

  it('offers the light logo as a download', () => {
    render(<LogoDownload />);

    const link = screen.getByRole('link', { name: logo.light.download });
    expect(link.getAttribute('href')).toBe('/assets/logo/logo-light-mode.png');
    expect(link.getAttribute('download')).toBe('vocab-logo-light.png');
  });

  it('offers the dark logo as a download', () => {
    render(<LogoDownload />);

    const link = screen.getByRole('link', { name: logo.dark.download });
    expect(link.getAttribute('href')).toBe('/assets/logo/logo-dark-mode.png');
    expect(link.getAttribute('download')).toBe('vocab-logo-dark.png');
  });
});
