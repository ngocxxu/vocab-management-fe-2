import React from 'react';
import { AlertCard } from './cards/AlertCard';
import { GraphsAnalysis } from './cards/GraphsAnalysis';
import { MetricsGrid } from './cards/MetricsGrid';
import { OngoingTasks } from './cards/OngoingTasks';
import { TopPerformance } from './cards/TopPerformance';

export const DashboardContent: React.FC = () => {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="mt-2 text-slate-600">Welcome back! Here's what's happening with your projects today.</p>
        </div>

        {/* Alert Card */}
        <AlertCard />

        {/* Metrics Grid */}
        <MetricsGrid />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Ongoing Tasks - Takes 2 columns */}
          <div className="lg:col-span-2">
            <OngoingTasks />
          </div>

          {/* Graphs and Analysis */}
          <div>
            <GraphsAnalysis />
          </div>
        </div>

        {/* Top Performance */}
        <TopPerformance />
      </div>
    </main>
  );
};
