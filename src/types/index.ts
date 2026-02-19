import type React from 'react';
import type { EQuestionType, EVocabTrainerStatus } from '@/enum/vocab-trainer';

export type TOption = { label: string; value: string };

export type ResponseAPI<T> = { items: T } & TPagination;

// Export auth types
export * from './auth';

// Export language types
export * from './language';

export type TPagination = {
  currentPage: number;
  totalItems: number;
  totalPages: number;
};

export type TPage = {
  page: string;
  pageSize: string;
  sortBy?: string;
  sortOrder?: string;
};

export type TVocabQuery = {
  textSource?: string;
  subjectIds?: string[];
  sourceLanguageCode?: string;
  targetLanguageCode?: string;
} & TPage;

export type TVocabTrainerQuery = {
  name?: string;
  status?: EVocabTrainerStatus;
  questionType?: EQuestionType;
} & TPage;

export enum EUserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

// Export language folder types
export * from './language-folder';

// Export notification types
export * from './notification';

export * from './plan';

// Export statistics types
export * from './statistics';

// Export subject types
export * from './subject';

export * from './word-type';

export type MenuItem = {
  id: string;
  path: string;
  label: string;
  icon: React.ReactNode;
  category?: string;
};

export type SidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
  isExpanded?: boolean;
};

export type HeaderProps = {
  onSidebarToggle: () => void;
  isSidebarExpanded?: boolean;
  allNotifications?: ResponseAPI<import('@/types/notification').TNotification[]> | null;
  unreadNotifications?: ResponseAPI<import('@/types/notification').TNotification[]> | null;
  unreadCount?: import('@/types/notification').TUnreadCountResponse | null;
  isLoading?: boolean;
  error?: string | null;
};

export type ProgressChartTooltipPayload = {
  date: string;
  averageMastery: number;
  [key: string]: unknown;
};

export type ProgressChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: ProgressChartTooltipPayload; [key: string]: unknown }>;
};

export type ProgressChartProps = {
  data: import('@/types/statistics').ProgressOverTime[];
};

export type TrendConfig = {
  text: string;
  icon: 'arrowUp' | 'arrowDown' | 'clock';
  color: 'success' | 'muted' | 'destructive';
};

export type SummaryStatsMetricCardProps = {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  iconBgClass: string;
  trend?: TrendConfig;
};

export type SummaryStatsCardProps = {
  data: import('@/types/statistics').MasterySummary;
};

export type SubjectMasteryChartProps = {
  data: import('@/types/statistics').MasteryBySubject[];
};

export type DistributionChartTooltipPayload = { name: string; count: number };

export type DistributionChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: DistributionChartTooltipPayload }>;
};

export type DistributionChartProps = {
  data: import('@/types/statistics').MasteryDistribution[];
};

export type ProblematicVocabsTableProps = {
  data: import('@/types/statistics').TopProblematicVocab[];
};

export type AnswerDistributionCardProps = {
  data: import('@/types/statistics').MasterySummary;
};

export type MetricsGridMetricCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
  trend?: string;
  trendColor?: string;
};

export type DashboardTask = {
  id: string;
  name: string;
  description: string;
  logo: string;
  logoColor: string;
  status?: string;
  progress?: string;
  dueDate?: string;
  teamMembers: number;
};

export type LoadingComponentProps = {
  title: string;
  description?: string;
};

export type ErrorStateProps = {
  message: string;
  className?: string;
};

export type DeleteActionButtonProps = {
  itemId: string;
  itemName: string;
  onDelete: (id: string) => Promise<void>;
  onSuccess?: () => void | Promise<void>;
  successMessage?: string;
  errorMessage?: string;
};

export type BulkDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemCount: number;
  itemName: string;
  itemNamePlural?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export type ExamErrorStateProps = {
  error: string | null;
  onBackToTrainers: () => void;
  variant?: 'fullscreen' | 'inline';
  fallbackMessage?: string;
};

export type SocketContextType = {
  socket: import('socket.io-client').Socket | null;
  isConnected: boolean;
};

export type SocketProviderProps = {
  children: React.ReactNode;
};
