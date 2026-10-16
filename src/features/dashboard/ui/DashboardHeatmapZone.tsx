import { ActivityHeatmapLazy } from '../components/ActivityHeatmapLazy';
import { ZoneError } from '../components/ZoneError';
import { getDashboardHeatmapData } from '../services/server/getDashboardHeatmapData';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

export async function DashboardHeatmapZone() {
  try {
    const { progress } = await getDashboardHeatmapData();
    return (
      <div className="h-full">
        <ActivityHeatmapLazy progress={progress} />
      </div>
    );
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/dashboard'));
    }
    return <ZoneError section="activity" />;
  }
}
