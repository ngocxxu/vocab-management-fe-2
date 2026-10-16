'use client';

import dynamic from 'next/dynamic';
import { HeatmapSkeleton } from './skeletons/HeatmapSkeleton';

// The 365-cell calendar is expensive to render; loading it after hydration keeps the rest of the page clickable.
export const ActivityHeatmapLazy = dynamic(
  () => import('./ActivityHeatmap').then(module => module.ActivityHeatmap),
  { ssr: false, loading: () => <HeatmapSkeleton /> },
);
