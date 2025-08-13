import { Download } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep'];
const data = [120, 135, 110, 145, 137, 130, 125, 140, 135];

export const GraphsAnalysis: React.FC = () => {
  const maxValue = Math.max(...data);

  return (
    <Card className="h-full overflow-hidden border-0 bg-white shadow-lg dark:bg-slate-800">
      <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Graphs and Analysis</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">Projects completed per month based on trends.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select defaultValue="month">
              <SelectTrigger className="h-10 w-28 rounded-xl border-slate-200 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-700 dark:focus:ring-blue-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
              <Download className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Chart */}
          <div className="flex h-48 items-end justify-between space-x-2">
            {data.map((value, index) => (
              <div key={index} className="flex flex-col items-center space-y-3">
                <div className="group relative">
                  <div
                    className={`w-10 rounded-t-lg transition-all duration-300 ${
                      index === 4
                        ? 'bg-gradient-to-t from-blue-700 to-blue-600 shadow-lg'
                        : 'bg-gradient-to-t from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-400'
                    } hover:shadow-md`}
                    style={{ height: `${(value / maxValue) * 100}%` }}
                  >
                    {/* Tooltip for Mei (highlighted month) */}
                    {index === 4 && (
                      <div className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-blue-400"></div>
                            <span>Project Done 137</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-blue-700"></div>
                            <span>Project Task 123</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-blue-200"></div>
                            <span>Project Goal 84</span>
                          </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{months[index]}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-600 dark:rounded-xl dark:bg-slate-800 dark:p-4 dark:text-slate-400 dark:shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-blue-400"></div>
              <span className="font-medium">Project Done</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-blue-700"></div>
              <span className="font-medium">Project Task</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-blue-200"></div>
              <span className="font-medium">Project Goal</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
