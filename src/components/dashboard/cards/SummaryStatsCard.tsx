'use client';

import type { MasterySummary } from '@/types/statistics';
import { BookOpen, CheckCircle, TrendingUp, XCircle } from 'lucide-react';
import React from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  subtitle?: string;
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, iconColor, subtitle }) => (
  <Card className="group overflow-hidden border-0 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:bg-white/90 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] dark:bg-slate-800/80 dark:hover:bg-slate-800/90">
    <CardContent className="px-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-5">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl sm:h-16 sm:w-16 ${iconColor} shadow-xl transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
          <div className="space-y-1 sm:space-y-2">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase sm:text-sm dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-600 sm:text-sm dark:text-slate-400">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const DonutChart: React.FC<{ correct: number; incorrect: number }> = ({ correct, incorrect }) => {
  const data = [
    { name: 'Correct', value: correct, color: '#10b981' },
    { name: 'Incorrect', value: incorrect, color: '#ef4444' },
  ];

  const total = correct + incorrect;
  const correctPercentage = total > 0 ? ((correct / total) * 100).toFixed(1) : '0';
  const incorrectPercentage = total > 0 ? ((incorrect / total) * 100).toFixed(1) : '0';

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="h-[120px] w-[120px]">
        <PieChart width={120} height={120}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={50}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
      <div className="space-y-1 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Correct:
            {' '}
            {correctPercentage}
            %
          </span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Incorrect:
            {' '}
            {incorrectPercentage}
            %
          </span>
        </div>
      </div>
    </div>
  );
};

const MasteryProgress: React.FC<{ mastery: number }> = ({ mastery }) => {
  const percentage = (mastery / 10) * 100;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (mastery >= 8) {
      return '#10b981';
    }
    if (mastery >= 6) {
      return '#3b82f6';
    }
    if (mastery >= 4) {
      return '#f59e0b';
    }
    return '#ef4444';
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative h-28 w-28">
        <svg className="h-28 w-28 -rotate-90 transform">
          <circle
            cx="56"
            cy="56"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx="56"
            cy="56"
            r="40"
            stroke={getColor()}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{mastery.toFixed(1)}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">/ 10</div>
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Average Mastery</p>
    </div>
  );
};

type SummaryStatsCardProps = {
  data: MasterySummary;
};

export const SummaryStatsCard: React.FC<SummaryStatsCardProps> = ({ data }) => {
  const metrics = [
    {
      title: 'Total Vocabs',
      value: data.totalVocabs,
      icon: <BookOpen className="h-7 w-7 text-white" />,
      iconColor: 'bg-gradient-to-br from-indigo-400 via-blue-500 to-indigo-600',
    },
    {
      title: 'Total Correct',
      value: data.totalCorrect,
      icon: <CheckCircle className="h-7 w-7 text-white" />,
      iconColor: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600',
    },
    {
      title: 'Total Incorrect',
      value: data.totalIncorrect,
      icon: <XCircle className="h-7 w-7 text-white" />,
      iconColor: 'bg-gradient-to-br from-red-400 via-rose-500 to-red-600',
    },
    {
      title: 'Average Mastery',
      value: data.averageMastery.toFixed(1),
      icon: <TrendingUp className="h-7 w-7 text-white" />,
      iconColor: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
    },
  ];

  return (
    <div className="relative space-y-6">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-slate-50/50 via-transparent to-blue-50/30 dark:from-slate-900/50 dark:to-slate-800/30" />

      <div className="grid grid-cols-1 gap-4 p-1 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {metrics.map(metric => (
          <div key={metric.title} className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
            <MetricCard {...metric} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <Card className="border-0 bg-white/80 shadow-lg dark:bg-slate-800/80">
          <CardContent className="px-4 sm:px-6">
            <h3 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg dark:text-white">Answer Distribution</h3>
            <DonutChart correct={data.totalCorrect} incorrect={data.totalIncorrect} />
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 shadow-lg dark:bg-slate-800/80">
          <CardContent className="px-4 sm:px-6">
            <h3 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg dark:text-white">Mastery Progress</h3>
            <MasteryProgress mastery={data.averageMastery} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
