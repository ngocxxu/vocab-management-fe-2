import type { TVocab } from './vocab-list';

export type MasterySummary = {
  totalVocabs: number;
  totalCorrect: number;
  totalIncorrect: number;
  averageMastery: number;
};

export type MasteryBySubject = {
  subjectId: string;
  subjectName: string;
  averageMastery: number;
  vocabCount: number;
};

export type ProgressOverTime = {
  date: string;
  averageMastery: number;
};

export type TopProblematicVocab = {
  vocabId: string;
  vocab: TVocab;
  incorrectCount: number;
  masteryScore: number;
  correctCount: number;
};

export type MasteryDistribution = {
  scoreRange: string;
  count: number;
};
