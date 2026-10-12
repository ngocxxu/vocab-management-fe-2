'use client';

import type { TAdminUser } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/shared/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { useUserSearch } from '../hooks/useUserSearch';

type TUserRecipientPickerProps = Readonly<{
  recipients: TAdminUser[];
  onChange: (recipients: TAdminUser[]) => void;
}>;

const displayName = (user: TAdminUser): string => `${user.firstName} ${user.lastName}`.trim() || user.email;

/** Picked users as removable chips. The form keeps only their IDs; the names live here. */
function RecipientChips({ recipients, onRemove }: Readonly<{ recipients: TAdminUser[]; onRemove: (user: TAdminUser) => void }>) {
  const t = useTranslations('admin.broadcasts');

  return (
    <div className="flex flex-wrap gap-2">
      {recipients.map(user => (
        <Badge key={user.id} variant="secondary" className="gap-1">
          {displayName(user)}
          <button
            type="button"
            aria-label={t('compose.removeUser', { name: displayName(user) })}
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onRemove(user)}
          >
            ×
          </button>
        </Badge>
      ))}
    </div>
  );
}

/** Searchable pick list for a users broadcast. Picked users show as chips; the form keeps only their IDs. */
export function UserRecipientPicker({ recipients, onChange }: TUserRecipientPickerProps) {
  const t = useTranslations('admin.broadcasts');
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const matches = useUserSearch(query);

  const isPicked = (user: TAdminUser): boolean => recipients.some(recipient => recipient.id === user.id);
  const togglePick = (user: TAdminUser): void => {
    onChange(isPicked(user) ? recipients.filter(recipient => recipient.id !== user.id) : [...recipients, user]);
  };

  return (
    <div className="flex flex-col gap-3">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="w-fit">{t('compose.addUsers')}</Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-0">
          <Command shouldFilter={false}>
            <CommandInput value={query} onValueChange={setQuery} placeholder={t('compose.searchUsers')} />
            <CommandList>
              <CommandEmpty>{t('compose.noUsers')}</CommandEmpty>
              {matches.map(user => (
                <CommandItem key={user.id} value={user.id} onSelect={() => togglePick(user)}>
                  <span className="truncate">{displayName(user)}</span>
                  <span className="truncate text-muted-foreground">{user.email}</span>
                  {isPicked(user) && <span className="ml-auto text-xs text-primary">{t('compose.picked')}</span>}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <RecipientChips recipients={recipients} onRemove={togglePick} />
    </div>
  );
}
