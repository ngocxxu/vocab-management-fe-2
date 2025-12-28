import type { PaginationState } from './useApiPagination';
import type { TLanguageFolder } from '@/types';
import type { TVocab } from '@/types/vocab-list';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getVocabsForSelection } from '@/actions';
import { getMyLanguageFoldersForSelection } from '@/actions/language-folders';
import { logger } from '@/libs/Logger';

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

  const languageFolders = useMemo(() => {
    return cachedLanguageFolders.length > 0 ? cachedLanguageFolders : fetchedLanguageFolders;
  }, [cachedLanguageFolders, fetchedLanguageFolders]);

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
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      ...filters,
    });

    if (lastFetchParamsRef.current === fetchParams) {
      return;
    }

    lastFetchParamsRef.current = fetchParams;

    const fetchVocabs = async () => {
      setIsLoading(true);
      try {
        const result = await getVocabsForSelection({
          page: pagination.page,
          pageSize: pagination.pageSize,
          sortBy: pagination.sortBy,
          sortOrder: pagination.sortOrder,
          textSource: filters.globalFilter || undefined,
          sourceLanguageCode: filters.sourceLanguageCode === 'ALL' ? undefined : filters.sourceLanguageCode,
          targetLanguageCode: filters.targetLanguageCode === 'ALL' ? undefined : filters.targetLanguageCode,
          languageFolderId: filters.languageFolderId === 'ALL' ? undefined : filters.languageFolderId,
        });
        if ('error' in result) {
          logger.error('Failed to fetch vocabs:', { error: result.error });
          return;
        }
        setVocabs(result.items || []);
        setTotalItems(result.totalItems || 0);
        setTotalPages(result.totalPages || 0);
        setCurrentPage(result.currentPage || 1);
      } catch (error) {
        logger.error('Failed to fetch vocabs:', { error });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVocabs();
  }, [open, pagination, filters]);

  return {
    vocabs,
    languageFolders,
    totalItems,
    totalPages,
    currentPage,
    isLoading,
  };
};
