import { Download } from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep'];
const data = [120, 135, 110, 145, 137, 130, 125, 140, 135];

export const GraphsAnalysis: React.FC = () => {
  const maxValue = Math.max(...data);

  return (
    <Card className="h-full overflow-hidden border-0 bg-card shadow-lg">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Graphs and Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">Projects completed per month based on trends.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select defaultValue="month">
              <SelectTrigger className="h-10 w-28 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
              <Download size={16} weight="BoldDuotone" className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Chart */}
          <div className="flex h-48 items-end justify-between space-x-2">
            {data.map((value, index) => (
              <div key={`month-${months[index]}-${value}`} className="flex flex-col items-center space-y-3">
                <div className="group relative">
                  <div
                    className={`w-10 rounded-t-lg transition-all duration-300 ${
                      index === 4
                        ? 'bg-primary shadow-lg'
                        : 'bg-primary/70 hover:bg-primary/80'
                    } hover:shadow-md`}
                    style={{ height: `${(value / maxValue) * 100}%` }}
                  >
                    {/* Tooltip for Mei (highlighted month) */}
                    {index === 4 && (
                      <div className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 rounded-xl bg-foreground px-4 py-3 text-background opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-primary/70"></div>
                            <span>Project Done 137</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-primary"></div>
                            <span>Project Task 123</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-primary/25"></div>
                            <span>Project Goal 84</span>
                          </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground"></div>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-muted-foreground">{months[index]}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 rounded-xl bg-muted/20 p-4 text-sm text-muted-foreground shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-primary/70"></div>
              <span className="font-medium">Project Done</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-primary"></div>
              <span className="font-medium">Project Task</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-primary/25"></div>
              <span className="font-medium">Project Goal</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
