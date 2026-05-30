'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { errorRateStatusConfig, getErrorRateTextClass } from '@/features/dashboard/utils/statusConfig';
import { Button } from '@/shared/ui/button';
import type { TTextTarget } from '@/types/vocab-list';
import Link from 'next/link';
import React from 'react';

import type { ProblematicVocabsTableProps } from '@/types';

function getDefinition(target: TTextTarget | undefined): string {
  if (!target) {
    return '—';
  }
  const part = target.wordType?.name
    ? `${target.wordType.name}. ${target.explanationTarget || target.explanationSource || ''}`.trim()
    : (target.explanationTarget || target.explanationSource || target.textTarget || '—');
  return part || target.textTarget || '—';
}

// function getCategory(target: TTextTarget | undefined): string {
//   const subject = target?.textTargetSubjects?.[0]?.subject?.name;
//   return subject ?? '—';
// }

function toErrorRatePct(errorRate: number): number {
  return Math.round(errorRate * 100);
}

export const ProblematicVocabsTable: React.FC<ProblematicVocabsTableProps> = ({ data, totalNeedReview }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="overflow-hidden border-0 bg-card shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-foreground">Top 10 Problematic Vocabs</CardTitle>
          <p className="text-sm text-muted-foreground">Words requiring immediate attention based on error rate.</p>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-sm text-muted-foreground">
            No words need review right now. Keep practicing!
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...data].sort((a, b) => b.errorRate - a.errorRate);
  const practiceCount = totalNeedReview > 0 ? totalNeedReview : sortedData.length;
  const showingSubset = sortedData.length < practiceCount;

  return (
    <Card className="overflow-hidden border-0 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl font-bold text-foreground">Top 10 Problematic Vocabs</CardTitle>
            <p className="text-sm text-muted-foreground">
              Words requiring immediate attention based on error rate.
              {showingSubset ? ` Showing top ${sortedData.length} of ${practiceCount}.` : null}
            </p>
          </div>
          {practiceCount > 0 && (
            <Button asChild className="shrink-0 rounded-xl font-semibold">
              <Link href="/vocab-trainer?preset=problematic">
                {`Practice These ${practiceCount} Words →`}
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Word</th>
                {/* <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Subject</th> */}
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Error rate</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => {
                const errorRatePct = toErrorRatePct(item.errorRate);
                const status = item.healthStatus;
                const statusStyle = errorRateStatusConfig[status];
                const target = item.vocab.textTargets?.[0];
                const definition = getDefinition(target);
                // const category = getCategory(target);

                return (
                  <tr
                    key={item.vocabId}
                    className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{item.vocab.textSource}</span>
                        <span className="mt-0.5 text-xs text-muted-foreground">{definition}</span>
                      </div>
                    </td>
                    {/* <td className="px-4 py-2.5 text-muted-foreground">{category}</td> */}
                    <td className={`px-4 py-2.5 font-medium ${getErrorRateTextClass(errorRatePct)}`}>
                      {errorRatePct}
                      %
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.className}`}>
                        {statusStyle.label}
                      </span>
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
