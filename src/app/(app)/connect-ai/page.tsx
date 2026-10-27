import { verifyUser } from '@/actions/auth';
import { ConnectAiPage, getMcpReadiness } from '@/features/connect-ai';
import { Env } from '@/libs/Env';
import { getExpiredSessionRedirect } from '@/utils/auth-error';
import { JetBrains_Mono } from 'next/font/google';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-connect-mono', display: 'swap' });

export default async function ConnectAiRoute() {
  const user = await verifyUser();
  if (!user) {
    redirect(getExpiredSessionRedirect('/connect-ai'));
  }

  const serverUrl = Env.NEXT_PUBLIC_MCP_URL ?? '';
  const readiness = getMcpReadiness(user, serverUrl);

  return (
    <div className={mono.variable}>
      <ConnectAiPage readiness={readiness} serverUrl={serverUrl} />
    </div>
  );
}
