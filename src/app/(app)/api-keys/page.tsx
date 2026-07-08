import { verifyUser } from '@/actions/auth';
import { ApiKeySection } from '@/components/settings';
import { getApiKeysPageData } from '@/features/api-keys/services/server/getApiKeysPageData';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ApiKeysPage() {
  const user = await verifyUser();
  if (!user) {
    redirect(getExpiredSessionRedirect('/api-keys'));
  }
  if (user.role === 'GUEST') {
    redirect('/dashboard');
  }

  const { initialApiKeysData, error } = await getApiKeysPageData();
  if (isUnauthorizedError(error)) {
    redirect(getExpiredSessionRedirect('/api-keys'));
  }

  return (
    <ApiKeySection initialApiKeysData={initialApiKeysData} />
  );
}
