import { BookOpen, CheckCircle, HelpCircle, Pencil, TrendingUp } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type MetricCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
  trend?: string;
  trendColor?: string;
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, iconColor, trend, trendColor }) => (
  <Card className="overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-slate-800">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${iconColor} shadow-lg`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            {trend && (
              <div className="flex items-center space-x-1">
                <TrendingUp className={`h-4 w-4 ${trendColor}`} />
                <span className={`text-sm font-medium ${trendColor}`}>{trend}</span>
              </div>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
          <TrendingUp className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const MetricsGrid: React.FC = () => {
  const metrics = [
    {
      title: 'Total Vocab',
      value: '547',
      icon: <BookOpen className="h-7 w-7 text-white" />,
      iconColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
      trend: '+12%',
      trendColor: 'text-emerald-600',
    },
    {
      title: 'New Vocab',
      value: '339',
      icon: <Pencil className="h-7 w-7 text-white" />,
      iconColor: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      trend: '+8%',
      trendColor: 'text-emerald-600',
    },
    {
      title: 'Not Known',
      value: '147',
      icon: <HelpCircle className="h-7 w-7 text-white" />,
      iconColor: 'bg-gradient-to-r from-purple-500 to-purple-600',
      trend: '+5%',
      trendColor: 'text-emerald-600',
    },
    {
      title: 'Mastered',
      value: '89',
      icon: <CheckCircle className="h-7 w-7 text-white" />,
      iconColor: 'bg-gradient-to-r from-orange-500 to-orange-600',
      trend: '+2.5%',
      trendColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};
