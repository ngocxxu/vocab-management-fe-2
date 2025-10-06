'use client';

import { Filter, Plus } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

type VocabTrainerHeaderProps = {
  totalCount: number;
  onAddTrainer: () => void;
};

const VocabTrainerHeader: React.FC<VocabTrainerHeaderProps> = ({
  totalCount,
  onAddTrainer,
}) => {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Vocab Trainers</h1>
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-sm font-medium text-purple-800 dark:bg-purple-900/20 dark:text-purple-200">
            {totalCount}
            {' '}
            Total
          </span>
        </div>

        <p className="text-slate-600 dark:text-slate-400">
          Create and manage your vocabulary training sessions to improve your language skills.
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="outline" className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button
          onClick={onAddTrainer}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Trainer
        </Button>
      </div>
    </div>
  );
};

export default VocabTrainerHeader;
