import type { AsyncSink, LogRecord, Sink } from '@logtape/logtape';
import * as Sentry from '@sentry/nextjs';
import { configure, fromAsyncSink, getConsoleSink, getJsonLinesFormatter, getLogger } from '@logtape/logtape';
import axiosInstance from './axios';
import { Env } from './Env';

const betterStackSink: AsyncSink = async (record) => {
  await axiosInstance.post(`https://${Env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST}`, record);
};

/**
 * Category segment used by the axios interceptors. Excluded from Sentry issue
 * capture: a backend outage there is ONE incident, not thousands of distinct
 * bugs, and Sentry bills per event with no spike protection on the free plan.
 * Those failures stay visible via Sentry Logs and onRequestError.
 */
const HTTP_CATEGORY = 'http';

/** Pull the original Error out of the log properties, if one was passed. */
function findError(properties: Record<string, unknown>): Error | undefined {
  for (const value of Object.values(properties)) {
    if (value instanceof Error) {
      return value;
    }
  }
  return undefined;
}

/**
 * Promotes handled-and-logged errors to Sentry issues.
 *
 * Without this, every caught error the app recovered from reached Sentry only
 * as a log line — visible during triage, but never grouped and never alerting.
 */
const sentrySink: Sink = (record: LogRecord) => {
  if (record.level !== 'error' || record.category.includes(HTTP_CATEGORY)) {
    return;
  }

  const original = findError(record.properties);

  if (original) {
    // Real stack, real grouping.
    Sentry.captureException(original, { tags: { source: 'logger' } });
    return;
  }

  // No Error to hand over. Synthesize one, but fingerprint on the log message
  // so call sites group by what was logged rather than by this sink's own
  // stack — otherwise every site collapses into one useless issue.
  const rawMessage = typeof record.rawMessage === 'string' ? record.rawMessage : record.rawMessage.join('');

  Sentry.withScope((scope) => {
    scope.setTag('source', 'logger');
    scope.setFingerprint([rawMessage]);
    Sentry.captureException(new Error(rawMessage));
  });
};

await configure({
  sinks: {
    console: getConsoleSink({ formatter: getJsonLinesFormatter() }),
    betterStack: fromAsyncSink(betterStackSink),
    sentry: sentrySink,
  },
  loggers: [
    { category: ['logtape', 'meta'], sinks: ['console'], lowestLevel: 'warning' },
    {
      category: ['app'],
      // sentry is always attached; the sink itself decides what to promote
      // (error level only, axios category excluded) and Sentry.init's
      // `enabled` flag makes it a no-op when capture is switched off.
      sinks: Env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN && Env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST
        ? ['console', 'betterStack', 'sentry']
        : ['console', 'sentry'],
      lowestLevel: 'debug',
    },
  ],
});

export const logger = getLogger(['app']);
