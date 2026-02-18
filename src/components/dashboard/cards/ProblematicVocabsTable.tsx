'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TTextTarget } from '@/types/vocab-list';
import Link from 'next/link';
import React from 'react';

import type { ProblematicVocabsTableProps } from '@/types';

function getErrorRateColor(pct: number): string {
  if (pct >= 60) {
    return '#EA4335';
  }
  if (pct >= 30) {
    return '#FBBC04';
  }
  return '#34A853';
}

function getStatus(pct: number): { label: string; className: string } {
  if (pct >= 60) {
    return { label: 'CRITICAL', className: 'bg-destructive/10 text-destructive' };
  }
  if (pct >= 30) {
    return { label: 'STRUGGLING', className: 'bg-warning/10 text-warning' };
  }
  return { label: 'REVIEW NEEDED', className: 'bg-warning/10 text-warning' };
}

function getDefinition(target: TTextTarget | undefined): string {
  if (!target) {
    return '—';
  }
  const part = target.wordType?.name
    ? `${target.wordType.name}. ${target.explanationTarget || target.explanationSource || ''}`.trim()
    : (target.explanationTarget || target.explanationSource || target.textTarget || '—');
  return part || target.textTarget || '—';
}

function getCategory(target: TTextTarget | undefined): string {
  const subject = target?.textTargetSubjects?.[0]?.subject?.name;
  return subject ?? '—';
}

export const ProblematicVocabsTable: React.FC<ProblematicVocabsTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="overflow-hidden border-0 bg-card shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-foreground">Problematic Vocabs</CardTitle>
          <p className="text-sm text-muted-foreground">Words requiring immediate attention based on recent errors.</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            No problematic vocabs found
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...data].sort((a, b) => b.incorrectCount - a.incorrectCount);

  return (
    <Card className="overflow-hidden border-0 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Problematic Vocabs</CardTitle>
            <p className="text-sm text-muted-foreground">Words requiring immediate attention based on recent errors.</p>
          </div>
          <Link
            href="/vocab-trainer"
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">Vocabulary Word</th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">Error Rate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => {
                const total = item.correctCount + item.incorrectCount;
                const errorRatePct = total > 0 ? Math.round((item.incorrectCount / total) * 100) : 0;
                const barColor = getErrorRateColor(errorRatePct);
                const status = getStatus(errorRatePct);
                const target = item.vocab.textTargets?.[0];
                const definition = getDefinition(target);
                const category = getCategory(target);

                return (
                  <tr
                    key={item.vocabId}
                    className="border-b border-border transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{item.vocab.textSource}</span>
                        <span className="mt-0.5 text-xs text-muted-foreground">{definition}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 min-w-[6rem] overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${errorRatePct}%`, backgroundColor: barColor }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {errorRatePct}
                          %
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                        <Link href="/vocab-trainer">Practice Now</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
