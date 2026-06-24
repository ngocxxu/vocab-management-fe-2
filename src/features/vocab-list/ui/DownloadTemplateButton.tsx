'use client';

import { Download } from '@solar-icons/react/ssr';
import React from 'react';
import * as XLSXStyle from 'xlsx-js-style';
import { Button } from '@/shared/ui/button';

const COLUMNS = [
  'textSource',
  'textTarget',
  'subjects',
  'wordType',
  'grammar',
  'explanationSource',
  'explanationTarget',
  'exampleSource',
  'exampleTarget',
  'synonyms',
  'antonyms',
  'relatedWords',
];

const REQUIRED_COL_INDICES = new Set([0, 1, 2]); // textSource, textTarget, subjects

const SAMPLE_ROWS = [
  ['hello', 'xin chào', 'Greetings', 'noun', '', '', '', '', '', 'hi; hey', 'goodbye', 'greet'],
  [
    'good morning',
    'chào buổi sáng',
    'Greetings; Daily phrases',
    'noun',
    '',
    '',
    '',
    'Good morning!',
    'Chào buổi sáng!',
    'morning greeting',
    'good evening',
    '',
  ],
];

const DownloadTemplateButton: React.FC = () => {
  const handleDownload = () => {
    const wb = XLSXStyle.utils.book_new();
    const ws = XLSXStyle.utils.aoa_to_sheet([COLUMNS, ...SAMPLE_ROWS]);

    COLUMNS.forEach((_, colIdx) => {
      const cellRef = XLSXStyle.utils.encode_cell({ r: 0, c: colIdx });
      if (ws[cellRef]) {
        ws[cellRef].s = REQUIRED_COL_INDICES.has(colIdx)
          ? { font: { bold: true, color: { rgb: 'FF0000' } } }
          : { font: { bold: true } };
      }
    });

    XLSXStyle.utils.book_append_sheet(wb, ws, 'Vocab Template');
    XLSXStyle.writeFile(wb, 'vocab-import-template.xlsx');
  };

  return (
    <Button variant="outline" onClick={handleDownload} className="bg-card/80 backdrop-blur-sm">
      <Download size={16} weight="BoldDuotone" className="mr-2" />
      Sample Template
    </Button>
  );
};

export default DownloadTemplateButton;
