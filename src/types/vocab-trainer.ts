import type React from 'react';
import type { ResponseAPI, TLanguage, TOption } from '.';
import type { EFsrsDirection, EFsrsRating, EFsrsState, EQuestionType, ETrainerMode, EVocabTrainerType } from '../enum/vocab-trainer';
import type { TSrsDefaults } from './srs-settings';
import type { TVocab } from './vocab-list';
import type { TVocabSelectionFolderArray } from './vocab-selection';

export type TVocabTrainer = {
  id: string;
  name: string;
  status: string;
  questionType: EQuestionType;
  reminderTime: number;
  countTime: number;
  setCountTime: number;
  reminderDisabled: boolean;
  reminderRepeat: number;
  reminderLastRemind: string;
  userId: string;
  vocabAssignments: TVocabAssignment[];
  results: TWordResults[];
  questionAnswers: TQuestion[];
  mode: ETrainerMode;
  fsrsDesiredRetention: number;
  fsrsMaximumInterval: number;
  /** Max new words per day; null = unlimited. */
  fsrsNewPerDay: number | null;
  fsrsDirections: EFsrsDirection[];
  /** End of the cycle; null = no end. */
  fsrsEndsAt: string | null;
  /** Only on the response of create/update: words that got no card because they have no translation yet. */
  fsrsSkippedVocabIds?: string[];
  updatedAt: string;
  createdAt: string;
};

export type TVocabAssignment = {
  id: string;
  vocabTrainerId: string;
  vocabId: string;
  vocab: TVocab;
};

export type TWordResults = {
  id: string;
  vocabTrainerId: string;
  status: string;
  userSelected: string;
  systemSelected: string;
};

export type TQuestion = {
  id?: string;
  content: string;
  options?: TOption[];
  type: EVocabTrainerType | 'textSource' | 'textTarget';
  correctAnswer: string;
};

export type TFormInputsVocabTrainer = {
  name: string;
  wordTestSelects: TWordTestSelect[];
  setCountTime: number;
};

export type TWordTestSelect = { systemSelected: string; userSelected: string };

export type TWordTestInput = { userAnswer: string; systemAnswer: string };

export type TFormTestVocabTrainer = {
  id: string;
  questionType: EQuestionType;
  countTime: number;
  wordTestSelects: TWordTestSelect[];
};

export type TFormTestVocabTrainerFillInBlank = {
  questionType: EQuestionType;
  countTime: number;
  wordTestInputs: TWordTestInput[];
};

export type TFormTestVocabTrainerUnion
  = | TFormTestVocabTrainer
    | TFormTestVocabTrainerFillInBlank
    | TFormTestVocabTrainerTranslationAudio;

export type TExamResult = {
  status: string;
  userSelected: string;
  systemSelected: string;
  data?: {
    explanation?: string;
  };
};

export type TExamSubmitResponse = {
  status: string;
  results: TExamResult[];
};

export type TQuestionAPI = {
  name: string;
  setCountTime: number;
  questionAnswers: TQuestion[];
  questionType: EQuestionType;
  jobId?: string;
};

export type TExamGenerationProgress = {
  jobId: string;
  status: 'generating' | 'completed' | 'failed';
  data?: {
    questions?: TQuestion[];
    error?: string;
  };
  timestamp: string;
};

export type TCreateVocabTrainer = {
  name: string;
  status: string;
  questionType: EQuestionType;
  reminderTime: number;
  countTime: number;
  setCountTime: number;
  reminderDisabled: boolean;
  reminderRepeat: number;
  reminderLastRemind: string;
  vocabAssignmentIds: string[];
  /** Fixed after creation. Without it the trainer is Classic. */
  mode?: ETrainerMode;
  fsrsDesiredRetention?: number;
  fsrsMaximumInterval?: number;
  fsrsNewPerDay?: number | null;
  /** Fixed after creation. */
  fsrsDirections?: EFsrsDirection[];
  fsrsEndsAt?: string | null;
};

/** Starts a new cycle from an FSRS trainer: the words, directions and settings are copied by the backend. */
export type TCloneVocabTrainer = {
  name: string;
  /** End of the new cycle (ISO date); null or missing = no end. */
  endsAt?: string | null;
};

/** What can change on an FSRS trainer after creation; mode and directions are fixed. Only the fields that are sent change. */
export type TUpdateFsrsSettings = {
  desiredRetention?: number;
  maximumInterval?: number;
  newPerDay?: number | null;
  endsAt?: string | null;
};

export type TFlipCardQuestion = {
  frontText: string[];
  backText: string[];
  frontLanguageCode: string;
  backLanguageCode: string;
};

export type TFlipCardResult = {
  cardIndex: number;
  frontText: string[];
  backText: string[];
  frontLanguageCode: string;
  backLanguageCode: string;
  assessment: 'known' | 'unknown';
  timeSpent: number; // seconds spent on this card
};

export type TFlipCardExamData = {
  trainerId: string;
  trainerName: string;
  questions: TFlipCardQuestion[];
  results: TFlipCardResult[];
  totalTimeElapsed: number;
  completedAt: string;
};

export type TTranslationAudioDialogue = {
  speaker: string;
  text: string;
};

export type TFormTestVocabTrainerTranslationAudio = {
  questionType: EQuestionType;
  fileId: string;
  targetStyle?: 'formal' | 'informal';
  targetAudience?: string;
  countTime: number;
};

export type TAudioEvaluationProgress = {
  jobId: string;
  status: 'evaluating' | 'completed' | 'failed';
  data?: {
    transcript?: string;
    markdownReport?: string;
    error?: string;
  };
  timestamp: string;
};

export type TFillInBlankEvaluationProgress = {
  jobId: string;
  status: 'evaluating' | 'completed' | 'failed';
  data?: {
    results?: TExamResult[];
    error?: string;
  };
  timestamp: string;
};

export type ExamState = 'taking' | 'submitting' | 'completed' | 'error';
export type TranslationAudioExamState = 'taking' | 'recording' | 'uploading' | 'submitting' | 'evaluating' | 'completed' | 'error';

export type FlipCardProps = {
  question: TFlipCardQuestion;
  isFlipped: boolean;
  onFlip: () => void;
  onPlayAudio?: () => void;
};

export type FlipCardExamProps = {
  trainerId: string;
  examData: TQuestionAPI | TFlipCardExamData;
};

export type FlipCardResultsProps = {
  trainerId: string;
  examData: TFlipCardExamData;
  onBackToTrainers: () => void;
};

export type VocabExamProps = {
  trainerId: string;
  examData: TQuestionAPI;
};

export type QuestionCardProps = {
  question: TQuestion;
  questionNumber: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
};

export type MarkdownReportProps = {
  markdown: string;
};

export type TranslationAudioResultsProps = {
  trainerId: string;
  transcript?: string;
  markdownReport?: string;
  timeElapsed: number;
  onBackToTrainers: () => void;
};

export type TranslationAudioExamProps = {
  trainerId: string;
  examData: TQuestionAPI;
};

export type AudioRecorderProps = {
  onRecordingComplete: (audioBlob: Blob) => void;
  onReset: () => void;
};

export type DialogueDisplayProps = {
  dialogue: TTranslationAudioDialogue[];
};

export type FillInBlankCardProps = {
  question: TQuestion;
  questionNumber: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

export type FillInBlankExamProps = {
  trainerId: string;
  examData: TQuestionAPI;
};

export type VocabExamHeaderProps = {
  trainerName: string;
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
  level?: string;
};

export type ExamResultsProps = {
  trainerId: string;
  results: TExamSubmitResponse;
  questions: TQuestion[];
  selectedAnswers: Map<number, string>;
  timeElapsed: number;
  onBackToTrainers: () => void;
  jobId?: string;
  completedAt?: string | Date;
  onRetryExam?: () => void;
  onExportPdf?: () => void;
  scoreDelta?: string;
  durationFasterText?: string;
  questionType?: EQuestionType;
};

export type VocabTrainerFormData = {
  name: string;
  mode: ETrainerMode;
  questionType: EQuestionType;
  setCountTime: number;
  reminderDisabled: boolean;
  vocabAssignmentIds: string[];
  fsrsDirections: EFsrsDirection[];
  fsrsDesiredRetention: number;
  fsrsMaximumInterval: number;
  /** null = unlimited. */
  fsrsNewPerDay: number | null;
  /** `YYYY-MM-DD`, empty = no deadline. */
  fsrsEndsAt: string;
};

export type AddVocabTrainerDialogProps = {
  formData: VocabTrainerFormData;
  onSubmit: () => Promise<void>;
  onReset: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  editMode?: boolean;
  editingItem?: TVocabTrainer | null;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
  cachedLanguageFolders?: TVocabSelectionFolderArray;
  onLanguageFoldersLoaded?: (folders: TVocabSelectionFolderArray) => void;
  userRole?: string;
  /** What a new spaced repetition trainer starts from. */
  srsDefaults?: TSrsDefaults;
};

export type QuickFilter = 'all' | 'recent' | 'difficult' | 'unstarted';

export type VocabSelectionFormProps = {
  selectedIds: string[];
  selectedVocabById?: Record<string, TVocab>;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
  open?: boolean;
  cachedLanguageFolders?: TVocabSelectionFolderArray;
  onLanguageFoldersLoaded?: (folders: TVocabSelectionFolderArray) => void;
  editMode?: boolean;
};

export type VocabSelectionScopeProps = {
  sourceLanguageCode: string;
  targetLanguageCode: string;
  languages: TLanguage[];
  onScopeChange: (sourceLanguageCode: string, targetLanguageCode: string) => void;
  outOfScopeCount: number;
  onRemoveOutOfScope: () => void;
};

export type VocabSelectionFiltersProps = {
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  languageFolderId: string;
  onLanguageFolderChange: (value: string) => void;
  languageFolders: TVocabSelectionFolderArray;
  quickFilter: QuickFilter;
  onQuickFilterChange: (id: QuickFilter) => void;
  randomCount: number;
  onRandomCountChange: (count: number) => void;
  /** How many words are in the current scope. Undefined while unknown: then the count is not capped. */
  maxRandomCount?: number;
  onRandomize: () => void;
  isRandomizeDisabled: boolean;
};

export type VocabTrainerLayoutProps = {
  initialData?: ResponseAPI<TVocabTrainer[]>;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
  currentUser?: import('@/types/auth').TUser | null;
  loadError?: string;
};

export type VocabTrainerHeaderProps = {
  totalCount: number;
  onAddTrainer: () => void;
  /** True while the user's defaults load: a trainer must not be created before they are known. */
  isCreateDisabled?: boolean;
  statusOptions: Array<{ value: string; label: string }>;
  selectedStatuses: string[];
  onStatusFilterChange: (statuses: string[]) => void;
  questionTypeOptions: Array<{ value: string; label: string }>;
  selectedQuestionTypes: string[];
  onQuestionTypeFilterChange: (questionTypes: string[]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
};

export type VocabTrainerContentProps = {
  initialData?: ResponseAPI<TVocabTrainer[]>;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
  currentUser?: import('@/types/auth').TUser | null;
  loadError?: string;
};

export type ExamLauncherProps = {
  trainerId: string;
  questionType: EQuestionType;
  /** A spaced repetition trainer opens its review session instead of an exam. */
  mode?: ETrainerMode;
};

export type VocabTrainerListProps = {
  initialData?: ResponseAPI<TVocabTrainer[]>;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
  currentUser?: import('@/types/auth').TUser | null;
  loadError?: string;
};

export type TFsrsPreviewButton = {
  /** When the card comes back if this button is pressed. */
  due: string;
  scheduledDays: number;
};

/** One card of a review session. `direction` decides which side is the question. */
export type TFsrsQueueItem = {
  cardId: string;
  vocabId: string;
  direction: EFsrsDirection;
  state: EFsrsState;
  isNew: boolean;
  frontText: string[];
  /** Every answer accepted for a typed answer. */
  acceptedAnswers: string[];
  frontLanguageCode: string;
  backLanguageCode: string;
  preview: Record<EFsrsRating, TFsrsPreviewButton>;
};

/** A fixed session list plus the counts around it. An ended trainer has no items. */
export type TFsrsReviewQueue = {
  ended: boolean;
  items: TFsrsQueueItem[];
  overdue: number;
  dueToday: number;
  newAvailable: number;
  pendingAfterThisSession: number;
};

export type TFsrsQueueParams = {
  /** Cards in the session (1-100, default 20). */
  limit?: number;
  /** Also include cards due within this many days after today (0-365). */
  ahead?: number;
};

export type TFsrsReviewSummary = {
  overdue: number;
  dueToday: number;
  newAvailable: number;
  mastered: number;
  leech: number;
  ended: boolean;
  endsAt: string | null;
  estimatedDaysToClearBacklog: number;
};

export type TFsrsAnswerDiffSegment = { type: 'same' | 'missing' | 'extra'; text: string };

/** Result of comparing a typed answer; nothing is recorded. */
export type TFsrsAnswerCheck = {
  correctAnswers: string[];
  diff: TFsrsAnswerDiffSegment[];
  suggestedRating: EFsrsRating.AGAIN | EFsrsRating.HARD | EFsrsRating.GOOD;
};

export type TFsrsAnswerInput = {
  cardId: string;
  /** Generated for each answer: sending the same one again does not schedule twice. */
  answerId: string;
  rating: EFsrsRating;
  questionType: EQuestionType.FLIP_CARD | EQuestionType.FILL_IN_THE_BLANK;
  /** Time from showing the card to rating it, in ms. */
  durationMs?: number;
};

export type TFsrsAnswerResult = {
  cardId: string;
  rating: EFsrsRating;
  state: EFsrsState;
  due: string;
  stability: number;
  difficulty: number;
  scheduledDays: number;
  isDuplicate: boolean;
};

/** Recording an answer on a trainer whose cycle is over is an expected outcome, not an error. */
export type TFsrsAnswerOutcome
  = | { ended: false; result: TFsrsAnswerResult }
    | { ended: true };

type TFsrsStabilityBucket = { label: string; count: number };

type TFsrsDirectionStats = {
  direction: EFsrsDirection;
  cards: number;
  new: number;
  review: number;
  mastered: number;
  leeches: number;
};

type TFsrsLeechCard = {
  cardId: string;
  vocabId: string;
  direction: EFsrsDirection;
  textSource: string;
  lapses: number;
};

/** Statistics of one FSRS trainer, apart from the Classic mastery score. */
export type TFsrsReviewStats = {
  ended: boolean;
  cardsByState: { new: number; review: number };
  mastered: number;
  leeches: number;
  byDirection: TFsrsDirectionStats[];
  /** Cards due on each of the next 30 days (overdue cards count on the first one). Empty once the cycle has ended. */
  forecast: Array<{ date: string; count: number }>;
  /** Share of the reviews of known cards that were not Again; `value` is null without any review. */
  trueRetention: { value: number | null; reviews: number; windowDays: number };
  stabilityBuckets: TFsrsStabilityBucket[];
  leechCards: TFsrsLeechCard[];
};

/** A card that was rated in this session. */
export type TFsrsReviewResult = {
  item: TFsrsQueueItem;
  rating: EFsrsRating;
};
