import { AdminUsersTable, getAdminUsersPageData } from '@/features/admin';
import { verifyUser } from '@/actions';
import { logger } from '@/libs/Logger';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type TPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({ searchParams }: TPageProps) {
  const user = await verifyUser();
  if (!user) {
    redirect(getExpiredSessionRedirect('/admin/users'));
  }

  try {
    const { query, page } = await getAdminUsersPageData(await searchParams);

    return <AdminUsersTable query={query} page={page} currentUserId={user.id} />;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/admin/users'));
    }

    logger.error('Failed to load admin users:', { error });
    const t = await getTranslations('admin.users');

    return <p className="text-destructive">{t('loadError')}</p>;
  }
}
