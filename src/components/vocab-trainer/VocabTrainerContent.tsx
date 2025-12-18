import type { ResponseAPI, TLanguage } from '@/types';
import type { TVocabTrainer } from '@/types/vocab-trainer';
import Link from 'next/link';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { VocabTrainerList } from './index';

type VocabTrainerContentProps = {
  initialData?: ResponseAPI<TVocabTrainer[]>;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
};

const VocabTrainerContent: React.FC<VocabTrainerContentProps> = ({ initialData, initialLanguagesData }) => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/30"
      suppressHydrationWarning
    >
      <div
        className="container mx-auto px-4 py-8"
        suppressHydrationWarning
      >
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Vocab Trainer</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <VocabTrainerList initialData={initialData} initialLanguagesData={initialLanguagesData} />
      </div>
    </div>
  );
};

export default VocabTrainerContent;
