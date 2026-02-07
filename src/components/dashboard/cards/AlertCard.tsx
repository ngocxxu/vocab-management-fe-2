import { DangerTriangle } from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const AlertCard: React.FC = () => {
  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg dark:from-red-950/30 dark:to-orange-950/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50">
              <DangerTriangle size={28} weight="BoldDuotone" className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Performance Alert</h3>
              <p className="text-slate-700 dark:text-slate-300">
                Dear Manager, We have observed a decline in
                {' '}
                <span className="font-semibold text-red-600 dark:text-red-400">[Hermawan]</span>
                's performance over the past 2 weeks.
              </p>
            </div>
          </div>
          <Button className="rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-6 py-2 font-medium text-white shadow-lg hover:from-red-700 hover:to-orange-700 dark:from-red-500 dark:to-orange-500 dark:hover:from-red-600 dark:hover:to-orange-600">
            View Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
