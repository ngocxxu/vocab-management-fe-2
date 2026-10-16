import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const Env = createEnv({
  server: {
    NESTJS_API_URL: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    // Server-side capture switch. Deliberately not NEXT_PUBLIC_: it must not
    // exist in the browser bundle. Only 'true' enables capture — resolved by
    // resolveSentry() in sentry-config.ts. A plain string, not an enum: an
    // unset Docker ARG arrives as '', which enum().optional() rejects, and a
    // Docker build must not fail just because the switch was left off.
    SENTRY_ENABLED: z.string().optional(),
    // Auth0 Regular Web Application. The secret never reaches the browser; AUTH0_DOMAIN is the tenant domain
    // (e.g. vocab-development.jp.auth0.com) and AUTH0_AUDIENCE must equal the BE's AUTH0_AUDIENCE.
    AUTH0_DOMAIN: z.string().optional(),
    AUTH0_CLIENT_ID: z.string().optional(),
    AUTH0_CLIENT_SECRET: z.string().optional(),
    AUTH0_AUDIENCE: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: z.string().optional(),
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
    NEXT_PUBLIC_API_URL: z.string().optional(),
    NEXT_PUBLIC_SOCKET_URL: z.string().optional(),
    // Browser capture switch. Only 'true' enables capture — resolved by
    // resolveSentry() in sentry-config.ts. Same reasoning as SENTRY_ENABLED
    // above: an unset Docker ARG arrives as '', which enum().optional()
    // rejects.
    NEXT_PUBLIC_SENTRY_ENABLED: z.string().optional(),
    // Says WHERE events go. Never whether — that is the switch above.
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    // Deployment label. A label, never a control. Falls back to NODE_ENV.
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().optional(),
  },
  shared: {
    NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN,
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NESTJS_API_URL: process.env.NESTJS_API_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    SENTRY_ENABLED: process.env.SENTRY_ENABLED,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
    NEXT_PUBLIC_SENTRY_ENABLED: process.env.NEXT_PUBLIC_SENTRY_ENABLED,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  },
});
