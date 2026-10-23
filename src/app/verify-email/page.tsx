import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';
import { getUnverifiedAccessToken } from '@/utils/auth-cookies';

// Public on purpose: the User cannot sign in yet, which is why they are here. proxy.ts does not guard this path.
// Resending needs the login's token from the callback's cookie; without it (expired, or opened directly) the User signs in again.
export default async function VerifyEmailPage() {
  const canResend = Boolean(await getUnverifiedAccessToken());

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <VerifyEmailForm canResend={canResend} />
      </div>
    </main>
  );
}
