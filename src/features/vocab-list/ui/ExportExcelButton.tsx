'use client';

import type { ExportExcelButtonProps } from '@/types/vocab-list';
import { Download } from '@solar-icons/react/ssr';
import React, { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import * as XLSXStyle from 'xlsx-js-style';
import { exportVocabsCsv } from '@/actions/vocabs';
import { Button } from '@/shared/ui/button';

const REQUIRED_COL_INDICES = new Set([0, 1, 2]); // textSource, textTarget, subjects
const NUM_EXPORT_COLS = 12;

const applyHeaderStyles = (worksheet: XLSX.WorkSheet): void => {
  for (let colIdx = 0; colIdx < NUM_EXPORT_COLS; colIdx++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = REQUIRED_COL_INDICES.has(colIdx)
        ? { font: { bold: true, color: { rgb: 'FF0000' } } }
        : { font: { bold: true } };
    }
  }
};

const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({ queryParams, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);

    try {
      const result = await exportVocabsCsv(queryParams);

      if ('error' in result) {
        throw new Error(result.error);
      }

      const csvText = await result.text();
      const workbook = XLSX.read(csvText, { type: 'string', raw: true });

      const sheetName = workbook.SheetNames[0];
      if (sheetName) {
        applyHeaderStyles(workbook.Sheets[sheetName]!);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `vocabs-export-${timestamp}.xlsx`;

      XLSXStyle.writeFile(workbook, filename);
      toast.success('Vocabularies exported successfully');
    } catch {
      toast.error('Failed to export vocabularies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isLoading}
      variant="outline"
      className="bg-card/80 backdrop-blur-sm"
    >
      <Download size={16} weight="BoldDuotone" className="mr-2" />
      {isLoading ? 'Exporting...' : 'Export Excel'}
    </Button>
  );
};

export default ExportExcelButton;
