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

export function formatAvgPerQuestion(totalSeconds: number, count: number): string {
  if (count <= 0) {
    return 'AVG. — PER QUESTION';
  }
  const avg = Math.round(totalSeconds / count);
  if (avg < 60) {
    return `AVG. ${avg}S PER QUESTION`;
  }
  const mm = Math.floor(avg / 60);
  const ss = avg % 60;
  return `AVG. ${mm}M ${ss}S PER QUESTION`;
}

export function formatCompletedAt(value: string | Date | undefined): string {
  if (!value) {
    return new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
