// labelKey is relative to the `vocabList` namespace; components translate it with t(labelKey).
export const TOGGLEABLE_COLUMNS = [
  { id: 'textTarget', labelKey: 'textTargetsTable.colTextTarget' },
  { id: 'wordType', labelKey: 'textTargetsTable.colType' },
  { id: 'grammar', labelKey: 'textTargetsTable.colGrammar' },
  { id: 'explanationSource', labelKey: 'textTargetsTable.colExplanationSource' },
  { id: 'explanationTarget', labelKey: 'textTargetsTable.colExplanationTarget' },
  { id: 'subjects', labelKey: 'textTargetsTable.colSubjects' },
  { id: 'examples', labelKey: 'textTargetsTable.colExamples' },
] as const;
