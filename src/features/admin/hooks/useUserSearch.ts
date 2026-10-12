'use client';

import type { TAdminUser } from '@/types/admin';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { searchAdminUsers } from '@/actions/admin-broadcasts';

const SEARCH_DEBOUNCE_MS = 300;

/** Active users matching `query`, looked up once typing pauses. A reply for an older query is dropped. */
export function useUserSearch(query: string): TAdminUser[] {
  const [users, setUsers] = useState<TAdminUser[]>([]);

  useEffect(() => {
    let isCurrent = true;
    const timer = setTimeout(() => {
      searchAdminUsers(query)
        .then((found) => {
          if (isCurrent) {
            setUsers(found);
          }
        })
        .catch((error: unknown) => {
          if (isCurrent) {
            setUsers([]);
            toast.error(error instanceof Error ? error.message : '');
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query]);

  return users;
}
