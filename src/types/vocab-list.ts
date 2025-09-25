export type TExamples = { source: string; target: string };

export type TTextTargetSubject = {
  id: string;
  subject: { id: string; name: string; order: number };
};

export type TTextTarget = {
  textTarget: string;
  wordType: { id: string; name: string; description: string };
  explanationSource: string;
  explanationTarget: string;
  vocabExamples: TExamples[];
  grammar: string;
  textTargetSubjects: TTextTargetSubject[];
};

export type TVocab = {
  id: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  textSource: string;
  textTargets: TTextTarget[];
};

export type TCreateVocab = {
  textSource: string;
  languageFolderId: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  textTargets: [
    {
      wordTypeId: string;
      textTarget: string;
      grammar: string;
      explanationSource: string;
      explanationTarget: string;
      subjectIds: string[];
      vocabExamples: TExamples[];
    },
  ];
};
