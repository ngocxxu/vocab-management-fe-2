import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';

// Public on purpose: the User cannot sign in yet, which is why they are here. proxy.ts does not guard this path.
export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <VerifyEmailForm />
      </div>
    </main>
  );
}
