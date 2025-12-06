'use client';

import type { TopProblematicVocab } from '@/types/statistics';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const getColor = (mastery: number): string => {
  if (mastery >= 8) {
    return '#10b981';
  }
  if (mastery >= 6) {
    return '#3b82f6';
  }
  if (mastery >= 4) {
    return '#f59e0b';
  }
  return '#ef4444';
};

type ProblematicVocabsTableProps = {
  data: TopProblematicVocab[];
};

export const ProblematicVocabsTable: React.FC<ProblematicVocabsTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="overflow-hidden border-0 bg-white shadow-lg dark:bg-slate-800">
        <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-700">
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Problematic Vocabs</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">Vocabs with the most incorrect answers.</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex h-32 items-center justify-center text-slate-500 dark:text-slate-400">
            No problematic vocabs found
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...data].sort((a, b) => b.incorrectCount - a.incorrectCount);
  const maxIncorrect = Math.max(...sortedData.map(item => item.incorrectCount));

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-lg dark:bg-slate-800">
      <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-700">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Problematic Vocabs</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">Vocabs with the most incorrect answers.</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Vocab</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Incorrect</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Correct</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Mastery</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => {
                const percentage = maxIncorrect > 0 ? (item.incorrectCount / maxIncorrect) * 100 : 0;
                const masteryColor = getColor(item.masteryScore);

                return (
                  <tr
                    key={item.vocabId}
                    className="border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{item.vocab.textSource}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-900 dark:text-white">{item.incorrectCount}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: '#ef4444',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.correctCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: masteryColor }}
                        />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {item.masteryScore.toFixed(1)}
                        </span>
                      </div>
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
