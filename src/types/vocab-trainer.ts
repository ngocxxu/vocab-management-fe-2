import type { TOption } from '.';
import type { EQuestionType, EVocabTrainerType } from '../enum/vocab-trainer';
import type { TVocab } from './vocab-list';

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
