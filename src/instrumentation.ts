import * as Sentry from '@sentry/nextjs';

import { version } from '../package.json';
import { resolveSentry, resolveSentryEnvironment } from '@/libs/sentry-config';
import { toPathname } from '@/libs/sentry-scrub';

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

/**
 * Rebuild the outgoing event from named fields only. Anything not listed is
 * dropped.
 *
 * This is an allowlist and not a denylist on purpose: a denylist silently leaks
 * whatever field the next SDK version starts attaching.
 */
function applyAllowlist(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  const pathname = toPathname(event.request?.url);

  return {
    // Required discriminant on ErrorEvent (always undefined); carried through
    // so the rebuilt object stays a valid ErrorEvent rather than a cast lie.
    type: event.type,
    event_id: event.event_id,
    timestamp: event.timestamp,
    platform: event.platform,
    level: event.level,
    environment: event.environment,
    release: event.release,
    server_name: event.server_name,
    transaction: event.transaction,
    fingerprint: event.fingerprint,
    exception: event.exception,
    tags: { ...event.tags, runtime: 'server' },
    contexts: {
      // Custom contexts pass through. The allowlist exists to stop the SDK
      // auto-attaching fields we never inspected; contexts are only ever set
      // by our own code at explicit call sites, so that risk does not apply
      // and dropping them silently destroys debugging data.
      ...event.contexts,
      // Always overridden, never inherited: the scrubbed pathname wins over
      // whatever the SDK put here. A context and not a tag, because
      // per-record paths would exhaust the tag cardinality budget and
      // fragment issue grouping.
      request: pathname ? { pathname } : undefined,
    },
    request: event.request?.method ? { method: event.request.method } : undefined,
    sdk: event.sdk,
  } as Sentry.ErrorEvent;
}

/** Guards against an error thrown inside the capture path looping forever. */
let capturing = false;

const sentryOptions: Sentry.NodeOptions | Sentry.EdgeOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Carries the decision. The init call itself is unconditional: initialising
  // with `enabled: false` still installs the SDK's async-context isolation, so
  // scope behaviour is identical whether or not we are sending.
  enabled: active,

  environment: resolveSentryEnvironment(
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    process.env.NODE_ENV,
  ),
  release: `vocab-management-fe@${version}`,

  // Spotlight is a local development overlay and has nothing to do with whether
  // we send to Sentry. Kept on its own condition so local debugging never
  // requires turning capture on.
  spotlight: process.env.NODE_ENV === 'development',

  integrations: [
    // `log` / `info` / `debug` are where developers interpolate whole objects,
    // and those objects are the ones carrying request bodies and user records.
    Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] }),
  ],

  // Never send request headers or the user's IP address.
  sendDefaultPii: false,

  // Off while on the Sentry free plan: tracing competes with error capture for
  // a quota that has no spike protection behind it.
  tracesSampleRate: 0,

  // Enable logs to be sent to Sentry
  _experiments: { enableLogs: true },

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  beforeSend(event) {
    if (!active) {
      return null;
    }

    if (capturing) {
      return null;
    }

    capturing = true;
    try {
      return applyAllowlist(event);
    } finally {
      capturing = false;
    }
  },
};

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init(sentryOptions);
  }
}

export const onRequestError = Sentry.captureRequestError;
