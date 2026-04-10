'use client';

import type { ExportExcelButtonProps } from '@/types/vocab-list';
import { Download } from '@solar-icons/react/ssr';
import React, { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { exportVocabsCsv } from '@/actions/vocabs';
import { Button } from '@/shared/ui/button';

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

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `vocabs-export-${timestamp}.xlsx`;

      XLSX.writeFile(workbook, filename);
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
