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
  content: string[];
  options: TOption[];
  type: EVocabTrainerType;
  correctAnswer: string;
};

export type TFormInputsVocabTrainer = {
  name: string;
  wordTestSelects: TWordTestSelect[];
  setCountTime: number;
};

export type TWordTestSelect = { systemSelected: string; userSelected: string };

export type TFormTestVocabTrainer = {
  id: string;
  questionType: EQuestionType;
  countTime: number;
  wordTestSelects: TWordTestSelect[];
};

export type TQuestionAPI = {
  name: string;
  setCountTime: number;
  questionAnswers: TQuestion[];
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
