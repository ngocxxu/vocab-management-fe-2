// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs';
import * as Spotlight from '@spotlightjs/spotlight';

import { version } from '../package.json';
import { resolveSentry } from '@/libs/sentry-config';

/**
 * NEXT_PUBLIC_SENTRY_ENABLED is the only switch that can reach the browser —
 * SENTRY_ENABLED is server-side and does not exist in this bundle. The DSN says
 * where events go, never whether. See src/libs/sentry-config.ts.
 */
const { active } = resolveSentry(
  process.env.NEXT_PUBLIC_SENTRY_ENABLED,
  process.env.NEXT_PUBLIC_SENTRY_DSN,
  'browser',
);

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Carries the decision; the init call itself is unconditional so the SDK's
  // scope handling is identical whether or not we are sending.
  enabled: active,

  environment: process.env.NODE_ENV,
  release: `vocab-management-fe@${version}`,

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration(),
    Sentry.consoleLoggingIntegration(),
  ],

  // Adds request headers and IP for users, for more info visit
  sendDefaultPii: true,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Define how likely Replay events are sampled.
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  _experiments: { enableLogs: true },

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});

// Local development overlay. Deliberately independent of the capture switch.
if (process.env.NODE_ENV === 'development') {
  Spotlight.init();
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
