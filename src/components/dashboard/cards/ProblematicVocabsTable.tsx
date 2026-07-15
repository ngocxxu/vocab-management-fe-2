'use client';

import { TOP_PROBLEMATIC_LIMIT } from '@/constants/statistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { errorRateStatusConfig, getErrorRateTextClass } from '@/features/dashboard/utils/statusConfig';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import type { TProblematicLanguage } from '@/types/statistics';
import type { TTextTarget } from '@/types/vocab-list';
import Link from 'next/link';
import { useState } from 'react';

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

function toErrorRatePct(errorRate: number): number {
  return Math.round(errorRate * 100);
}

function languageLabel(language: TProblematicLanguage): string {
  return language.sourceLanguageName ?? language.sourceLanguageCode.toUpperCase();
}

export function ProblematicVocabsTable({ languages, itemsByLang }: ProblematicVocabsTableProps) {
  const [activeCode, setActiveCode] = useState(languages[0]?.sourceLanguageCode ?? '');

  if (languages.length === 0) {
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

  // Fall back to the first language if the active code somehow no longer exists.
  // languages is non-empty here (guarded above), so languages[0] is defined.
  const activeLanguage = languages.find(language => language.sourceLanguageCode === activeCode) ?? languages[0]!;
  const activeCodeSafe = activeLanguage.sourceLanguageCode;

  const sortedData = [...(itemsByLang[activeCodeSafe] ?? [])]
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, TOP_PROBLEMATIC_LIMIT);

  const totalAvailable = activeLanguage.total;
  const practiceCount = Math.min(totalAvailable, TOP_PROBLEMATIC_LIMIT);
  const showingSubset = totalAvailable > TOP_PROBLEMATIC_LIMIT;

  return (
    <Card className="overflow-hidden border-0 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl font-bold text-foreground">Top 10 Problematic Vocabs</CardTitle>
            <p className="text-sm text-muted-foreground">
              Words requiring immediate attention based on error rate.
              {showingSubset ? ` Showing top ${sortedData.length} of ${totalAvailable}.` : null}
            </p>
          </div>
          {practiceCount > 0 && (
            <Button asChild className="shrink-0 rounded-xl font-semibold">
              <Link href={`/vocab-trainer?preset=problematic&sourceLanguageCode=${encodeURIComponent(activeCodeSafe)}`}>
                {`Practice These ${practiceCount} Words →`}
              </Link>
            </Button>
          )}
        </div>
        <Tabs value={activeCodeSafe} onValueChange={setActiveCode} className="mt-4 w-full">
          <TabsList variant="underline">
            {languages.map(language => (
              <TabsTrigger key={language.sourceLanguageCode} value={language.sourceLanguageCode} variant="underline">
                {languageLabel(language)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Word</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Error rate</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0
                ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No words need review for this language.
                      </td>
                    </tr>
                  )
                : sortedData.map((item) => {
                    const errorRatePct = toErrorRatePct(item.errorRate);
                    const status = item.healthStatus;
                    const statusStyle = errorRateStatusConfig[status];
                    const target = item.vocab.textTargets?.[0];
                    const definition = getDefinition(target);

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
}
