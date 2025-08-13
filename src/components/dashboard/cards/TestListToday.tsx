import { CheckCircle, Clock, Filter, Search, User } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Task = {
  id: string;
  name: string;
  description: string;
  logo: string;
  logoColor: string;
  status?: string;
  progress?: string;
  dueDate?: string;
  teamMembers: number;
};

const tasks: Task[] = [
  {
    id: '1',
    name: 'Journey Scarves',
    description: 'Rebranding and Website Design',
    logo: 'J',
    logoColor: 'bg-gradient-to-r from-slate-800 to-slate-900',
    teamMembers: 3,
  },
  {
    id: '2',
    name: 'Edifier',
    description: 'Web Design & Development',
    logo: 'EDIFIER',
    logoColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
    status: 'On Going',
    progress: '51%',
    dueDate: 'Aug, 17 2024',
    teamMembers: 2,
  },
  {
    id: '3',
    name: 'Ugreen',
    description: 'Web App & Dashboard',
    logo: 'UGREEN',
    logoColor: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    status: 'On Going',
    progress: '89%',
    dueDate: 'Aug, 15 2024',
    teamMembers: 3,
  },
  {
    id: '4',
    name: 'CNN',
    description: 'Rebranding and Sosmed Content',
    logo: 'CNN',
    logoColor: 'bg-gradient-to-r from-red-500 to-red-600',
    teamMembers: 4,
  },
];

export const OngoingTasks: React.FC = () => {
  return (
    <Card className="overflow-hidden border-0 bg-white shadow-lg dark:bg-slate-800">
      <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Test List Today</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">List of tests available today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <Input placeholder="Search..." className="h-10 w-48 rounded-xl border-slate-200 pl-10 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-700 dark:focus:ring-blue-400" />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 hover:bg-slate-50">
              <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-200 hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-lg ${task.logoColor}`}>
                    <span className="text-lg font-bold">{task.logo}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{task.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{task.description}</p>
                    {task.status && (
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          <span className="text-slate-600 dark:text-slate-400">
                            Status:
                            <span className="font-semibold text-slate-900 dark:text-white">{task.status}</span>
                          </span>
                        </div>
                        {task.progress && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                            <span className="text-slate-600 dark:text-slate-400">
                              Progress:
                              <span className="font-semibold text-slate-900 dark:text-white">{task.progress}</span>
                            </span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            <span className="text-slate-600 dark:text-slate-400">
                              Due:
                              <span className="font-semibold text-slate-900 dark:text-white">{task.dueDate}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {task.teamMembers}
                    {' '}
                    members
                  </span>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: task.teamMembers }).map((_, index) => (
                      <div key={index} className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-slate-200 to-slate-300 shadow-sm">
                        <User className="h-4 w-4 text-slate-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
