import {
  CheckCircle,
  ClockCircle,
  Filter,
  Magnifer,
  User,
} from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import type { DashboardTask } from '@/types';

const tasks: DashboardTask[] = [
  {
    id: '1',
    name: 'Journey Scarves',
    description: 'Rebranding and Website Design',
    logo: 'J',
    logoColor: 'bg-primary',
    teamMembers: 3,
  },
  {
    id: '2',
    name: 'Edifier',
    description: 'Web Design & Development',
    logo: 'EDIFIER',
    logoColor: 'bg-primary',
    status: 'On Going',
    progress: '51%',
    dueDate: 'Aug, 17 2026',
    teamMembers: 2,
  },
  {
    id: '3',
    name: 'Ugreen',
    description: 'Web App & Dashboard',
    logo: 'UGREEN',
    logoColor: 'bg-success',
    status: 'On Going',
    progress: '89%',
    dueDate: 'Aug, 15 2026',
    teamMembers: 3,
  },
  {
    id: '4',
    name: 'CNN',
    description: 'Rebranding and Sosmed Content',
    logo: 'CNN',
    logoColor: 'bg-destructive',
    teamMembers: 4,
  },
];

export const OngoingTasks: React.FC = () => {
  return (
    <Card className="overflow-hidden border-0 bg-card shadow-lg">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Test List Today</CardTitle>
            <p className="text-sm text-muted-foreground">List of tests available today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Magnifer size={16} weight="BoldDuotone" className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="h-10 w-48 rounded-xl pl-10" />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
              <Filter size={16} weight="BoldDuotone" className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="rounded-xl border border-border bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/30 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl text-primary-foreground shadow-lg ${task.logoColor}`}>
                    <span className="text-lg font-bold">{task.logo}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{task.name}</h3>
                    <p className="text-muted-foreground">{task.description}</p>
                    {task.status && (
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <ClockCircle size={16} weight="BoldDuotone" className="text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Status:
                            <span className="font-semibold text-foreground">{task.status}</span>
                          </span>
                        </div>
                        {task.progress && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle size={16} weight="BoldDuotone" className="text-success" />
                            <span className="text-muted-foreground">
                              Progress:
                              <span className="font-semibold text-foreground">{task.progress}</span>
                            </span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center space-x-2">
                            <ClockCircle size={16} weight="BoldDuotone" className="text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Due:
                              <span className="font-semibold text-foreground">{task.dueDate}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {task.teamMembers}
                    {' '}
                    members
                  </span>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: task.teamMembers }, (_, index) => (
                      <div key={`team-member-${task.id}-${index}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shadow-sm">
                        <User size={16} weight="BoldDuotone" className="text-muted-foreground" />
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
