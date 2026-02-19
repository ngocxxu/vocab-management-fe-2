import type React from 'react';
import type { ResponseAPI, TLanguage, TOption } from '.';
import type { EQuestionType, EVocabTrainerType } from '../enum/vocab-trainer';
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
  questionType: EQuestionType;
  setCountTime: number;
  reminderDisabled: boolean;
  vocabAssignmentIds: string[];
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
};

export type QuickFilter = 'all' | 'recent' | 'difficult' | 'unlearned';

export type VocabSelectionFormProps = {
  selectedIds: string[];
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
  open?: boolean;
  cachedLanguageFolders?: TVocabSelectionFolderArray;
  onLanguageFoldersLoaded?: (folders: TVocabSelectionFolderArray) => void;
  editMode?: boolean;
};

export type VocabTrainerLayoutProps = {
  initialData?: ResponseAPI<TVocabTrainer[]>;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
};

export type VocabTrainerHeaderProps = {
  totalCount: number;
  onAddTrainer: () => void;
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
};

export type ExamLauncherProps = {
  trainerId: string;
  questionType: EQuestionType;
};

export type VocabTrainerListProps = {
  initialData?: ResponseAPI<TVocabTrainer[]>;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
};
