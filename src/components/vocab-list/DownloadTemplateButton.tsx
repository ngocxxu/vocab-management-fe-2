'use client';

import { Download } from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/components/ui/button';

const DownloadTemplateButton: React.FC = () => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/assets/files/vocab-import-template.xls';
    link.download = 'vocab-import-template.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80"
    >
      <Download size={16} weight="BoldDuotone" className="mr-2" />
      Sample Template
    </Button>
  );
};

export default DownloadTemplateButton;
