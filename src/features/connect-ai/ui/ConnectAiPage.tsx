'use client';

import type { TMcpReadiness } from '@/types/connect-ai';
import { PAGE_CONTAINER_CLASS } from '@/components/shared/page-layout';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { UpsellModal } from '@/components/premium';
import { Button } from '@/shared/ui/button';
import { CopyField } from './CopyField';
import { LogoDownload } from './LogoDownload';
import { PlatformGuide } from './PlatformGuide';

type TConnectAiPageProps = Readonly<{
  readiness: TMcpReadiness;
  serverUrl: string;
}>;

const STEPS = ['status', 'server', 'connect', 'tryIt'] as const;
const STEP_STAGGER_MS = 80;
const TROUBLESHOOT_ITEMS = ['requiresPlan', 'accessDisabled', 'unauthorized'] as const;

export function ConnectAiPage({ readiness, serverUrl }: TConnectAiPageProps) {
  const t = useTranslations('connectAi');
  const [activeStep, setActiveStep] = useState(0);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);

  const isBlocked = readiness.plan === 'locked' || readiness.access === 'disabled';

  const markers = [
    { key: 'plan', ready: readiness.plan === 'ok', label: readiness.plan === 'ok' ? t('readiness.ok') : t('readiness.locked') },
    { key: 'access', ready: readiness.access === 'ok', label: readiness.access === 'ok' ? t('readiness.ok') : t('readiness.disabled') },
    { key: 'server', ready: readiness.server === 'ok', label: readiness.server === 'ok' ? t('readiness.ok') : t('readiness.missing') },
  ];

  const statusLines = [
    { key: 'plan', ok: readiness.plan === 'ok', text: readiness.plan === 'ok' ? t('status.planOk') : t('status.planLocked') },
    { key: 'access', ok: readiness.access === 'ok', text: readiness.access === 'ok' ? t('status.accessOk') : t('status.accessDisabled') },
    { key: 'server', ok: readiness.server === 'ok', text: readiness.server === 'ok' ? t('status.serverOk') : t('status.serverMissing') },
  ];
  const allReady = statusLines.every(line => line.ok);

  return (
    <div className={`${PAGE_CONTAINER_CLASS} gap-8`}>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{t('title')}</h1>
      </header>

      <ul className="flex flex-wrap gap-2">
        {markers.map(marker => (
          <li
            key={marker.key}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${marker.ready ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-border bg-muted text-muted-foreground'}`}
          >
            <span className="font-medium">{t(`readiness.${marker.key}`)}</span>
            <span>{marker.label}</span>
          </li>
        ))}
      </ul>

      {readiness.plan === 'locked' && (
        <div role="status" className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">{t('banner.locked')}</p>
          <Button type="button" size="sm" onClick={() => setIsUpsellOpen(true)}>{t('banner.upgrade')}</Button>
        </div>
      )}
      {readiness.plan === 'ok' && readiness.access === 'disabled' && (
        <div role="status" className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-foreground">{t('banner.disabled')}</p>
        </div>
      )}
      <UpsellModal open={isUpsellOpen} onOpenChange={setIsUpsellOpen} featureName={t('banner.feature')} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className={`min-w-0 lg:sticky lg:top-6 lg:self-start ${isBlocked ? 'opacity-60' : ''}`}>
          <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {STEPS.map((step, index) => {
              const isActive = index === activeStep;
              return (
                <li
                  key={step}
                  className="shrink-0 motion-safe:animate-in motion-safe:fill-mode-both motion-safe:fade-in motion-safe:slide-in-from-left-2"
                  style={{ animationDelay: `${index * STEP_STAGGER_MS}ms` }}
                >
                  <button
                    type="button"
                    aria-current={isActive ? 'step' : undefined}
                    onClick={() => setActiveStep(index)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:w-full ${isActive ? 'border-primary bg-primary/10 text-foreground' : 'border-transparent text-muted-foreground hover:bg-muted'}`}
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
                    >
                      {index + 1}
                    </span>
                    <span>{t(`steps.${step}`)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section
          aria-labelledby="connect-ai-step-title"
          className={`flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm transition-opacity sm:p-6 ${isBlocked && activeStep > 0 ? 'opacity-60' : ''}`}
        >
          <h2 id="connect-ai-step-title" className="text-lg font-semibold text-foreground">
            {t(`steps.${STEPS[activeStep]}`)}
          </h2>

          {activeStep === 0 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
              <ul className="flex flex-col gap-3 text-sm text-foreground">
                {statusLines.map(line => (
                  <li key={line.key} className="flex items-start gap-3">
                    <span aria-hidden="true" className={`mt-1.5 size-2 shrink-0 rounded-full ${line.ok ? 'bg-primary' : 'bg-destructive'}`} />
                    <span>{line.text}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-medium text-foreground">{allReady ? t('status.ready') : t('status.fixFirst')}</p>
            </div>
          )}

          {activeStep === 1 && (serverUrl
            ? (
                <>
                  <p className="text-sm text-muted-foreground">{t('server.hint')}</p>
                  <CopyField label={t('server.label')} value={serverUrl} />
                </>
              )
            : <p role="status" className="text-sm text-muted-foreground">{t('server.missing')}</p>)}

          {activeStep === 2 && (
            <>
              <PlatformGuide />
              <LogoDownload />
            </>
          )}

          {activeStep === 3 && (
            <>
              <CopyField label={t('tryIt.title')} value={t('tryIt.prompt')} />
              <p className="text-sm text-muted-foreground">{t('readOnly')}</p>
            </>
          )}
        </section>
      </div>

      <section aria-labelledby="connect-ai-troubleshoot-title" className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <h2 id="connect-ai-troubleshoot-title" className="text-sm font-semibold text-foreground">
          {t('troubleshoot.title')}
        </h2>
        {TROUBLESHOOT_ITEMS.map(item => (
          <details key={item} className="rounded-xl border border-border px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              {t(`troubleshoot.${item}.summary`)}
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{t(`troubleshoot.${item}.body`)}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
