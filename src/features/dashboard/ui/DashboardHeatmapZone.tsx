import { ActivityHeatmap } from '@/features/dashboard/components/ActivityHeatmap';
import { ZoneError } from '@/features/dashboard/components/ZoneError';
import { getDashboardHeatmapData } from '@/features/dashboard/services/server/getDashboardHeatmapData';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

export async function DashboardHeatmapZone() {
  try {
    const { progress } = await getDashboardHeatmapData();
    return (
      <div className="h-full">
        <ActivityHeatmap progress={progress} />
      </div>
    );
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/dashboard'));
    }
    return <ZoneError sectionName="activity" />;
  }
}
