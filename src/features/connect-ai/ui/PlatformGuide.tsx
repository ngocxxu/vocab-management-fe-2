'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

type TPlatform = 'chatgpt' | 'claude';

const PLATFORMS: TPlatform[] = ['chatgpt', 'claude'];
const STEP_KEYS = ['step1', 'step2', 'step3'] as const;

// Official docs. The OpenAI help center returns 403 to automated fetches, so this link is the developer MCP page.
const HELP_URLS: Partial<Record<TPlatform, string>> = {
  chatgpt: 'https://developers.openai.com/docs/mcp',
  claude: 'https://claude.com/docs/connectors/custom/remote-mcp',
};

export function PlatformGuide() {
  const t = useTranslations('connectAi');

  return (
    <Tabs defaultValue="chatgpt" className="gap-4">
      <TabsList>
        {PLATFORMS.map(platform => (
          <TabsTrigger key={platform} value={platform}>
            {t(`platforms.${platform}`)}
          </TabsTrigger>
        ))}
      </TabsList>
      {PLATFORMS.map(platform => (
        <TabsContent key={platform} value={platform} className="flex flex-col gap-4">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
            {STEP_KEYS.map(step => (
              <li key={step}>{t(`${platform}.${step}`)}</li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground">{t(`${platform}.note`)}</p>
          {HELP_URLS[platform] && (
            <a
              href={HELP_URLS[platform]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {t(`${platform}.learnMore`)}
            </a>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
