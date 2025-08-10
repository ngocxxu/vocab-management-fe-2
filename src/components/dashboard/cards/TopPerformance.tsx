import { Award, Download, Medal, Star, Trophy } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Employee = {
  id: string;
  rank: string;
  name: string;
  avatar: string;
  icon: React.ReactNode;
};

const employees: Employee[] = [
  { id: '1', rank: '1st', name: 'Meylina', avatar: 'M', icon: <Trophy className="h-6 w-6 text-yellow-500" /> },
  { id: '2', rank: '2nd', name: 'Jonathan', avatar: 'J', icon: <Medal className="h-6 w-6 text-slate-400" /> },
  { id: '3', rank: '3rd', name: 'Yasmine', avatar: 'Y', icon: <Award className="h-6 w-6 text-orange-500" /> },
  { id: '4', rank: '4th', name: 'Ronald', avatar: 'R', icon: <Star className="h-6 w-6 text-blue-500" /> },
];

const rankColors = {
  '1st': 'bg-gradient-to-r from-yellow-400 to-yellow-500',
  '2nd': 'bg-gradient-to-r from-slate-400 to-slate-500',
  '3rd': 'bg-gradient-to-r from-orange-400 to-orange-500',
  '4th': 'bg-gradient-to-r from-blue-400 to-blue-500',
};

export const TopPerformance: React.FC = () => {
  return (
    <Card className="overflow-hidden border-0 bg-white shadow-lg">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">Top Performence</CardTitle>
            <p className="text-sm text-slate-600">Best performing employee ranking.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select defaultValue="augustus">
              <SelectTrigger className="h-10 w-32 rounded-xl border-slate-200 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="augustus">Augustus</SelectItem>
                <SelectItem value="july">July</SelectItem>
                <SelectItem value="june">June</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 hover:bg-slate-50">
              <Download className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {employees.map(employee => (
            <div key={employee.id} className="text-center">
              <div className="relative mx-auto mb-4 inline-block">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-white to-slate-50 shadow-sm">
                    {employee.icon}
                  </div>
                </div>
                <div className={`absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg ${rankColors[employee.rank as keyof typeof rankColors]}`}>
                  <span className="text-xs font-bold">{employee.rank}</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{employee.name}</h3>
              <p className="text-sm text-slate-500">Top Performer</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
