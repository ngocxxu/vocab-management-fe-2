import { generateTextTargetContent } from '@/actions/vocabs';

export async function generateTextTarget(params: {
  textSource: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
}) {
  return await generateTextTargetContent(params);
}
