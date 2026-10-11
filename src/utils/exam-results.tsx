import React from 'react';

export function parseContentWithQuotedHighlight(content: string): React.ReactNode {
  const parts = content.split('"');
  if (parts.length === 1) {
    return content;
  }
  return parts.map((segment, i) => {
    if (i % 2 === 1) {
      return (
        <span key={`quote-${segment.slice(0, 20)}-${segment.length}`} className="text-primary">
          &quot;
          {segment}
          &quot;
        </span>
      );
    }
    return segment;
  });
}

export function formatDurationColon(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Translator that takes a full message key, e.g. `trainer.results.avgNone`. */
export type TExamResultsTranslator = (key: string, values?: Record<string, string | number>) => string;

export function formatAvgPerQuestion(totalSeconds: number, count: number, t: TExamResultsTranslator): string {
  if (count <= 0) {
    return t('trainer.results.avgNone');
  }
  const avg = Math.round(totalSeconds / count);
  if (avg < 60) {
    return t('trainer.results.avgSeconds', { seconds: avg });
  }
  const mm = Math.floor(avg / 60);
  const ss = avg % 60;
  return t('trainer.results.avgMinutes', { minutes: mm, seconds: ss });
}

export function formatCompletedAt(value: string | Date | undefined, locale: string): string {
  if (!value) {
    return new Date().toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
  }
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
}
