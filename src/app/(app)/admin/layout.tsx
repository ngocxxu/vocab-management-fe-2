import type { ReactNode } from 'react';
import { verifyUser } from '@/actions/auth';
import { AdminNav } from '@/features/admin';
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

  return (
    <div className="flex flex-col gap-6">
      <AdminNav />
      {children}
    </div>
  );
}
