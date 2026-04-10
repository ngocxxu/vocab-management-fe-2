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
      className="bg-card/80 backdrop-blur-sm"
    >
      <Download size={16} weight="BoldDuotone" className="mr-2" />
      Sample Template
    </Button>
  );
};

export default DownloadTemplateButton;
