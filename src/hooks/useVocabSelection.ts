import type { PaginationState } from './useApiPagination';
import type { TLanguageFolder } from '@/types';
import type { QuickFilter } from '@/types/vocab-trainer';
import type { TVocab } from '@/types/vocab-list';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getVocabsForSelection } from '@/actions';
import { getMyLanguageFoldersForSelection } from '@/actions/language-folders';
import { logger } from '@/libs/Logger';
import { isSameLocalDay } from '@/utils/date';
import { getMasteryStatus } from '@/utils/vocab-mastery';

const QUICK_FILTER_PAGE_SIZE = 1000;
const QUICK_FILTER_MAX_ITEMS = 20_000;

export type VocabFilters = {
  globalFilter: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  languageFolderId: string;
};

type UseVocabSelectionOptions = {
  open: boolean;
  pagination: PaginationState;
  filters: VocabFilters;
  quickFilter?: QuickFilter;
  cachedLanguageFolders?: TLanguageFolder[];
  onLanguageFoldersLoaded?: (folders: TLanguageFolder[]) => void;
};

type UseVocabSelectionReturn = {
  vocabs: TVocab[];
  languageFolders: TLanguageFolder[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
};

export const useVocabSelection = ({
  open,
  pagination,
  filters,
  quickFilter = 'all',
  cachedLanguageFolders = [],
  onLanguageFoldersLoaded,
}: UseVocabSelectionOptions): UseVocabSelectionReturn => {
  const [vocabs, setVocabs] = useState<TVocab[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedLanguageFolders, setFetchedLanguageFolders] = useState<TLanguageFolder[]>([]);
  const lastFetchParamsRef = useRef<string>('');
  const hasFetchedLanguageFoldersRef = useRef<boolean>(false);

  const isQuickFilterActive = quickFilter !== 'all';

  const languageFolders = useMemo(() => {
    return cachedLanguageFolders.length > 0 ? cachedLanguageFolders : fetchedLanguageFolders;
  }, [cachedLanguageFolders, fetchedLanguageFolders]);

  const isToday = (createdAt: string | undefined): boolean => {
    if (!createdAt) {
      return false;
    }
    const created = new Date(createdAt);
    if (Number.isNaN(created.getTime())) {
      return false;
    }
    return isSameLocalDay(created, new Date());
  };

  const filteredVocabs = useMemo(() => {
    if (!isQuickFilterActive) {
      return vocabs;
    }
    if (quickFilter === 'recent') {
      return vocabs.filter(v => isToday(v.createdAt));
    }
    if (quickFilter === 'difficult') {
      return vocabs.filter(v => getMasteryStatus(v.masteryScore) === 'Beginner');
    }
    if (quickFilter === 'unlearned') {
      return vocabs.filter(v => getMasteryStatus(v.masteryScore) === 'Unstarted');
    }
    return vocabs;
  }, [isQuickFilterActive, quickFilter, vocabs]);

  const paginatedVocabs = useMemo(() => {
    if (!isQuickFilterActive) {
      return vocabs;
    }
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredVocabs.slice(start, end);
  }, [filteredVocabs, isQuickFilterActive, pagination.page, pagination.pageSize, vocabs]);

  const totalItemsComputed = isQuickFilterActive ? filteredVocabs.length : totalItems;
  const totalPagesComputed = isQuickFilterActive
    ? (totalItemsComputed === 0 ? 0 : Math.ceil(totalItemsComputed / pagination.pageSize))
    : totalPages;
  const currentPageComputed = isQuickFilterActive
    ? (totalPagesComputed === 0 ? 1 : Math.min(pagination.page, totalPagesComputed))
    : currentPage;

  useEffect(() => {
    if (!open) {
      hasFetchedLanguageFoldersRef.current = false;
      return;
    }

    if (cachedLanguageFolders.length > 0 || hasFetchedLanguageFoldersRef.current) {
      return;
    }

    const fetchLanguageFolders = async () => {
      hasFetchedLanguageFoldersRef.current = true;
      try {
        const result = await getMyLanguageFoldersForSelection({ page: 1, pageSize: 100 });
        if ('error' in result) {
          logger.error('Failed to fetch language folders:', { error: result.error });
          hasFetchedLanguageFoldersRef.current = false;
          return;
        }
        const folders = result.items || [];
        setFetchedLanguageFolders(folders);
        onLanguageFoldersLoaded?.(folders);
      } catch (error) {
        logger.error('Failed to fetch language folders:', { error });
        hasFetchedLanguageFoldersRef.current = false;
      }
    };
    fetchLanguageFolders();
  }, [open, cachedLanguageFolders, onLanguageFoldersLoaded]);

  useEffect(() => {
    if (!open) {
      lastFetchParamsRef.current = '';
      return;
    }

    const fetchParams = JSON.stringify({
      page: isQuickFilterActive ? 1 : pagination.page,
      pageSize: isQuickFilterActive ? QUICK_FILTER_PAGE_SIZE : pagination.pageSize,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      ...filters,
      clientQuickFilter: isQuickFilterActive ? quickFilter : 'all',
    });

    if (lastFetchParamsRef.current === fetchParams) {
      return;
    }

    lastFetchParamsRef.current = fetchParams;

    const fetchVocabs = async () => {
      setIsLoading(true);
      try {
        const baseParams = {
          sortBy: pagination.sortBy,
          sortOrder: pagination.sortOrder,
          textSource: filters.globalFilter || undefined,
          sourceLanguageCode: filters.sourceLanguageCode === 'ALL' ? undefined : filters.sourceLanguageCode,
          targetLanguageCode: filters.targetLanguageCode === 'ALL' ? undefined : filters.targetLanguageCode,
          languageFolderId: filters.languageFolderId === 'ALL' ? undefined : filters.languageFolderId,
        } as const;

        if (!isQuickFilterActive) {
          const result = await getVocabsForSelection({
            page: pagination.page,
            pageSize: pagination.pageSize,
            ...baseParams,
          });
          if ('error' in result) {
            logger.error('Failed to fetch vocabs:', { error: result.error });
            return;
          }
          setVocabs(result.items || []);
          setTotalItems(result.totalItems || 0);
          setTotalPages(result.totalPages || 0);
          setCurrentPage(result.currentPage || 1);
          return;
        }

        const maxPages = Math.max(1, Math.ceil(QUICK_FILTER_MAX_ITEMS / QUICK_FILTER_PAGE_SIZE));
        const collected: TVocab[] = [];

        for (let page = 1; page <= maxPages; page += 1) {
          const result = await getVocabsForSelection({
            page,
            pageSize: QUICK_FILTER_PAGE_SIZE,
            ...baseParams,
          });
          if ('error' in result) {
            logger.error('Failed to fetch vocabs:', { error: result.error, page });
            return;
          }

          const items = result.items || [];
          collected.push(...items);

          const totalPagesFromApi = result.totalPages || 0;
          if (totalPagesFromApi > 0 && page >= totalPagesFromApi) {
            break;
          }
          if (items.length === 0) {
            break;
          }
          if (collected.length >= QUICK_FILTER_MAX_ITEMS) {
            break;
          }
        }

        setVocabs(collected.slice(0, QUICK_FILTER_MAX_ITEMS));
        setTotalItems(collected.length);
        setTotalPages(Math.ceil(collected.length / pagination.pageSize));
        setCurrentPage(1);
      } catch (error) {
        logger.error('Failed to fetch vocabs:', { error });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVocabs();
  }, [open, pagination.page, pagination.pageSize, pagination.sortBy, pagination.sortOrder, filters, isQuickFilterActive, quickFilter]);

  return {
    vocabs: isQuickFilterActive ? paginatedVocabs : vocabs,
    languageFolders,
    totalItems: totalItemsComputed,
    totalPages: totalPagesComputed,
    currentPage: currentPageComputed,
    isLoading,
  };
};
