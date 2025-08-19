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
  <Card className="group overflow-hidden border-0 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:bg-white/90 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] dark:bg-slate-800/80 dark:hover:bg-slate-800/90">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-5">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${iconColor} shadow-xl transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">{title}</p>
            <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
            {trend && (
              <div className="flex items-center space-x-2">
                <TrendingUp className={`h-4 w-4 ${trendColor} drop-shadow-sm`} />
                <span className={`text-sm font-semibold ${trendColor} tracking-wide`}>{trend}</span>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-slate-100/80 dark:hover:bg-slate-700/80"
        >
          <TrendingUp className="h-5 w-5 text-slate-400 dark:text-slate-500" />
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
      iconColor: 'bg-gradient-to-br from-indigo-400 via-blue-500 to-indigo-600',
      trend: '+12%',
      trendColor: 'text-emerald-600',
    },
    {
      title: 'New Vocab',
      value: '339',
      icon: <Pencil className="h-7 w-7 text-white" />,
      iconColor: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600',
      trend: '+8%',
      trendColor: 'text-emerald-600',
    },
    {
      title: 'Not Known',
      value: '147',
      icon: <HelpCircle className="h-7 w-7 text-white" />,
      iconColor: 'bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600',
      trend: '+5%',
      trendColor: 'text-emerald-600',
    },
    {
      title: 'Mastered',
      value: '89',
      icon: <CheckCircle className="h-7 w-7 text-white" />,
      iconColor: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
      trend: '+2.5%',
      trendColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-slate-50/50 via-transparent to-blue-50/30 dark:from-slate-900/50 dark:to-slate-800/30" />

      <div className="grid grid-cols-1 gap-8 p-1 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div key={`metric-${metric.title}-${index}`} className="relative">
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
            <MetricCard {...metric} />
          </div>
        ))}
      </div>
    </div>
  );
};
