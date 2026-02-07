import {
  Book,
  CheckCircle,
  GraphUp,
  Pen,
  QuestionCircle,
} from '@solar-icons/react/ssr';
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
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-5">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl sm:h-16 sm:w-16 ${iconColor} shadow-xl transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
          <div className="space-y-1 sm:space-y-2">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase sm:text-sm dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{value}</p>
            {trend && (
              <div className="flex items-center space-x-2">
                <GraphUp size={16} weight="BoldDuotone" className={`${trendColor} drop-shadow-sm`} />
                <span className={`text-xs font-semibold sm:text-sm ${trendColor} tracking-wide`}>{trend}</span>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 flex-shrink-0 rounded-xl opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-slate-100/80 dark:hover:bg-slate-700/80"
        >
          <GraphUp size={20} weight="BoldDuotone" className="text-slate-400 dark:text-slate-500" />
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
      icon: <Book size={28} weight="BoldDuotone" className="text-white" />,
      iconColor: 'bg-gradient-to-br from-indigo-400 via-blue-500 to-indigo-600',
      trend: '+12%',
      trendColor: 'text-emerald-600',
    },
    {
      title: 'New Vocab',
      value: '339',
      icon: <Pen size={28} weight="BoldDuotone" className="text-white" />,
      iconColor: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600',
      trend: '+8%',
      trendColor: 'text-emerald-600',
    },
    {
      title: 'Not Known',
      value: '147',
      icon: <QuestionCircle size={28} weight="BoldDuotone" className="text-white" />,
      iconColor: 'bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600',
      trend: '+5%',
      trendColor: 'text-emerald-600',
    },
    {
      title: 'Mastered',
      value: '89',
      icon: <CheckCircle size={28} weight="BoldDuotone" className="text-white" />,
      iconColor: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
      trend: '+2.5%',
      trendColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-slate-50/50 via-transparent to-blue-50/30 dark:from-slate-900/50 dark:to-slate-800/30" />

      <div className="grid grid-cols-1 gap-4 p-1 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {metrics.map(metric => (
          <div key={metric.title} className="relative">
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
            <MetricCard {...metric} />
          </div>
        ))}
      </div>
    </div>
  );
};
