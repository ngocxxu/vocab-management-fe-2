import { DangerTriangle } from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const AlertCard: React.FC = () => {
  return (
    <Card className="overflow-hidden border-0 bg-destructive/10 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/15">
              <DangerTriangle size={28} weight="BoldDuotone" className="text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Performance Alert</h3>
              <p className="text-muted-foreground">
                Dear Manager, We have observed a decline in
                {' '}
                <span className="font-semibold text-destructive">[Hermawan]</span>
                's performance over the past 2 weeks.
              </p>
            </div>
          </div>
          <Button variant="destructive" className="rounded-xl px-6 py-2 font-medium shadow-lg">
            View Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
