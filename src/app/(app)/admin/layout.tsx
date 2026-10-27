import type { ReactNode } from 'react';
import { PAGE_CONTAINER_CLASS } from '@/components/shared/page-layout';
import { verifyUser } from '@/actions/auth';
import { AdminNav, AdminPageHeader } from '@/features/admin';
import { getExpiredSessionRedirect } from '@/utils/auth-error';
import { isAdmin } from '@/utils/is-admin';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await verifyUser();
  if (!user) {
    redirect(getExpiredSessionRedirect('/admin'));
  }
  // Non-admins get the same 404 as an unknown path, so the area is not discoverable.
  if (!isAdmin(user)) {
    notFound();
  }

  // Same gutter and width as the other app pages, so admin content does not sit against the sidebar.
  return (
    <div className={`${PAGE_CONTAINER_CLASS} gap-6`}>
      <AdminPageHeader />
      <AdminNav />
      {children}
    </div>
  );
}
