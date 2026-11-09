'use client';

import type { TAiCatalogKind, TAiCatalogProvider, TAiModel } from '@/types/admin';
import type { TAiModelCatalogStatus } from '../utils/ai-model-catalog';
import { useEffect, useState } from 'react';
import { listAdminAiModels } from '@/actions/admin-system';

type TAiModelCatalogState = {
  status: TAiModelCatalogStatus;
  models: TAiModel[];
};

type TAiModelCatalogAnswer = {
  request: string;
  state: TAiModelCatalogState;
};

const IDLE: TAiModelCatalogState = { status: 'idle', models: [] };
const LOADING: TAiModelCatalogState = { status: 'loading', models: [] };
const DEGRADED: TAiModelCatalogState = { status: 'degraded', models: [] };

// One key per provider and kind, so a reply can be matched to the request it answers.
const toRequestKey = (provider: TAiCatalogProvider, kind: TAiCatalogKind): string => `${provider}:${kind}`;

/** Suggestions for one provider and kind. Idle when there is no provider to ask. A reply for an older request is ignored. */
export function useAiModelCatalog(provider: TAiCatalogProvider | null, kind: TAiCatalogKind): TAiModelCatalogState {
  const [answer, setAnswer] = useState<TAiModelCatalogAnswer | null>(null);

  useEffect(() => {
    if (provider === null) {
      return undefined;
    }

    const request = toRequestKey(provider, kind);
    let isCurrent = true;
    listAdminAiModels({ provider, kind })
      .then((catalog) => {
        if (isCurrent) {
          setAnswer({ request, state: { status: catalog.degraded ? 'degraded' : 'ready', models: catalog.models } });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setAnswer({ request, state: DEGRADED });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [provider, kind]);

  if (provider === null) {
    return IDLE;
  }

  return answer?.request === toRequestKey(provider, kind) ? answer.state : LOADING;
}
