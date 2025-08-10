import type { AsyncSink } from '@logtape/logtape';
import { configure, fromAsyncSink, getConsoleSink, getJsonLinesFormatter, getLogger } from '@logtape/logtape';
import axiosInstance from './axios';
import { Env } from './Env';

const betterStackSink: AsyncSink = async (record) => {
  await axiosInstance.post(`https://${Env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST}`, record);
};

await configure({
  sinks: {
    console: getConsoleSink({ formatter: getJsonLinesFormatter() }),
    betterStack: fromAsyncSink(betterStackSink),
  },
  loggers: [
    { category: ['logtape', 'meta'], sinks: ['console'], lowestLevel: 'warning' },
    {
      category: ['app'],
      sinks: Env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN && Env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST
        ? ['console', 'betterStack']
        : ['console'],
      lowestLevel: 'debug',
    },
  ],
});

export const logger = getLogger(['app']);
