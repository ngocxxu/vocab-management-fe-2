import type { TVocab } from './vocab-list';

export type TMasterySummary = {
  totalVocabs: number;
  totalCorrect: number;
  totalIncorrect: number;
  averageMastery: number;
  lastPracticeAt: string | null;
  criticalCount: number;
  warningCount: number;
};

export type TMasteryBySubject = {
  subjectId: string;
  subjectName: string;
  averageMastery: number;
  vocabCount: number;
};

export type TProgressOverTime = {
  date: string;
  averageMastery: number;
  practiceCount: number;
};

export type TTopProblematicVocab = {
  vocabId: string;
  vocab: TVocab;
  incorrectCount: number;
  masteryScore: number;
  correctCount: number;
};

export type TMasteryDistribution = {
  scoreRange: string;
  count: number;
};

export type TDashboardStatistics = {
  summary?: TMasterySummary;
  subjects?: TMasteryBySubject[];
  problematic?: TTopProblematicVocab[];
  distribution?: TMasteryDistribution[];
  progress?: TProgressOverTime[];
};

/** @deprecated Use TMasterySummary */
export type MasterySummary = TMasterySummary;
/** @deprecated Use TMasteryBySubject */
export type MasteryBySubject = TMasteryBySubject;
/** @deprecated Use TProgressOverTime */
export type ProgressOverTime = TProgressOverTime;
/** @deprecated Use TTopProblematicVocab */
export type TopProblematicVocab = TTopProblematicVocab;
/** @deprecated Use TMasteryDistribution */
export type MasteryDistribution = TMasteryDistribution;
