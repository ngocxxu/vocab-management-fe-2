import { verifyUser } from '@/actions';
import { getPlans } from '@/actions/plans';
import { getSrsSettings } from '@/actions/srs-settings';
import { ProfilePage } from '@/components/settings';
import { logger } from '@/libs/Logger';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProfileRoutePage() {
  try {
    const user = await verifyUser();
    const currentPlan = user?.role ? (await getPlans(user.role))[0] ?? null : null;
    const srsSettings = await getSrsSettings().catch((error: unknown) => {
      if (isUnauthorizedError(error)) {
        throw error;
      }
      // The rest of the profile still works without this section.
      logger.error('Failed to load spaced repetition settings:', { error });
      return null;
    });
    return <ProfilePage currentUser={user} currentPlan={currentPlan} srsSettings={srsSettings} />;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/profile'));
    }

    throw error;
  }
}
