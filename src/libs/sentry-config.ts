/**
 * Sentry enable/disable resolution.
 *
 * The rule this module exists to enforce: the DSN says *where* events go, never
 * *whether* they go. Capture is controlled by a dedicated switch, and only the
 * exact string 'true' turns it on — a truthiness check would make
 * `SENTRY_ENABLED=false` mean "enabled", which is how the previous
 * `NEXT_PUBLIC_SENTRY_DISABLED` flag misbehaved.
 *
 * Nothing here reads `process.env` directly. The two runtimes read different
 * variables (`SENTRY_ENABLED` is server-only and does not exist in the browser
 * bundle), so both values are passed in by the caller.
 */

export type TSentryRuntime = 'server' | 'browser';

export type TSentryResolution = {
  /** The switch alone: was capture asked for? */
  readonly enabled: boolean;
  /** Switch on AND a destination configured. This is what gates capture. */
  readonly active: boolean;
  readonly dsn: string;
};

/**
 * The deployment label events are tagged with.
 *
 * Falls back to NODE_ENV, but is deliberately a separate variable: NODE_ENV is
 * a build mode, not a deployment identity. The Docker image hardcodes it to
 * `production`, so staging and production built from one image would otherwise
 * report as the same environment and Sentry would merge their issues.
 *
 * An unset Docker ARG arrives as an empty string, so this uses `||` rather than
 * `??` — empty must fall through to NODE_ENV, not win.
 */
export function resolveSentryEnvironment(
  value: string | undefined,
  nodeEnv: string | undefined,
): string {
  return value?.trim() || nodeEnv || 'unknown';
}

/** Only the exact string 'true'. No truthiness, no `!== 'false'`. */
export function isSentrySwitchOn(value: string | undefined): boolean {
  return value === 'true';
}

/**
 * A switch turned on with no destination is a misconfiguration, not an off
 * state: the SDK would initialise and silently discard every event. Say so once.
 */
export function resolveSentry(
  switchValue: string | undefined,
  dsnValue: string | undefined,
  runtime: TSentryRuntime,
): TSentryResolution {
  const enabled = isSentrySwitchOn(switchValue);
  const dsn = dsnValue ?? '';

  if (enabled && !dsn) {
    console.warn(
      `[sentry] capture switch is on for the ${runtime} runtime but the DSN is missing; capture disabled`,
    );
  }

  return { enabled, active: enabled && Boolean(dsn), dsn };
}
