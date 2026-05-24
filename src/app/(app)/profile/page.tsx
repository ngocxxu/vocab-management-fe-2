import { verifyUser } from '@/actions';
import { getPlans } from '@/actions/plans';
import { ProfilePage } from '@/components/settings';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProfileRoutePage() {
  try {
    const user = await verifyUser();
    const currentPlan = user?.role ? (await getPlans(user.role))[0] ?? null : null;
    return <ProfilePage currentUser={user} currentPlan={currentPlan} />;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/profile'));
    }

    throw error;
  }
}
