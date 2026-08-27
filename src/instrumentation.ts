import * as Sentry from '@sentry/nextjs';

import { version } from '../package.json';
import { resolveSentry } from '@/libs/sentry-config';

/**
 * Server and edge runtime Sentry setup.
 *
 * Capture is gated on SENTRY_ENABLED — a server-only variable that never
 * reaches the browser bundle. The DSN says where events go, never whether.
 * See src/libs/sentry-config.ts.
 */
const { active } = resolveSentry(
  process.env.SENTRY_ENABLED,
  process.env.NEXT_PUBLIC_SENTRY_DSN,
  'server',
);

const sentryOptions: Sentry.NodeOptions | Sentry.EdgeOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Carries the decision. The init call itself is unconditional: initialising
  // with `enabled: false` still installs the SDK's async-context isolation, so
  // scope behaviour is identical whether or not we are sending.
  enabled: active,

  // NODE_ENV is the only signal available today. If staging and production ever
  // ship from the same build, this needs a dedicated variable to tell them apart.
  environment: process.env.NODE_ENV,
  release: `vocab-management-fe@${version}`,

  // Spotlight is a local development overlay and has nothing to do with whether
  // we send to Sentry. Kept on its own condition so local debugging never
  // requires turning capture on.
  spotlight: process.env.NODE_ENV === 'development',

  integrations: [
    Sentry.consoleLoggingIntegration(),
  ],

  // Never send request headers or the user's IP address.
  sendDefaultPii: false,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  _experiments: { enableLogs: true },

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
};

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init(sentryOptions);
  }
}

export const onRequestError = Sentry.captureRequestError;
