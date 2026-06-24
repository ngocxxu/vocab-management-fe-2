'use client';

import type { TVocabGenerateTextTargetResult } from '@/types/vocab-list';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { generateTextTargetContent } from '@/actions/vocabs';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/utils/socket-config';
import { useTextTargetCooldown } from './useTextTargetCooldown';

type UseAIGenerateParams = {
  textSource: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  targetIndex: number;
  hasExamples: boolean;
  onInputChange: (field: string, value: string, targetIndex: number) => void;
  onExampleChange: (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number) => void;
  onAddExample: (targetIndex: number) => void;
};

export function useAIGenerate({
  textSource,
  sourceLanguageCode,
  targetLanguageCode,
  targetIndex,
  hasExamples,
  onInputChange,
  onExampleChange,
  onAddExample,
}: UseAIGenerateParams) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const { isCooldownActive, cooldownRemaining, markUsed } = useTextTargetCooldown();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected || !currentJobId) {
      return;
    }

    const handler = (data: TVocabGenerateTextTargetResult) => {
      if (String(data.jobId) !== String(currentJobId)) {
        return;
      }

      const { result } = data;
      onInputChange('textTarget', result.textTarget, targetIndex);
      onInputChange('wordTypeId', result.wordTypeId ?? '', targetIndex);
      onInputChange('explanationSource', result.explanationSource, targetIndex);
      onInputChange('explanationTarget', result.explanationTarget, targetIndex);

      if (result.vocabExamples && result.vocabExamples.length > 0) {
        const firstExample = result.vocabExamples[0];
        if (hasExamples) {
          onExampleChange(0, 'source', firstExample?.source ?? '', targetIndex);
          onExampleChange(0, 'target', firstExample?.target ?? '', targetIndex);
        } else {
          onAddExample(targetIndex);
          setTimeout(() => {
            onExampleChange(0, 'source', firstExample?.source ?? '', targetIndex);
            onExampleChange(0, 'target', firstExample?.target ?? '', targetIndex);
          }, 0);
        }
      }

      toast.success('AI generated content successfully');
      markUsed();
      setIsGenerating(false);
      setCurrentJobId(null);
    };

    socket.on(SOCKET_EVENTS.VOCAB_GENERATE_TEXT_TARGET_RESULT, handler);
    return () => {
      socket.off(SOCKET_EVENTS.VOCAB_GENERATE_TEXT_TARGET_RESULT, handler);
    };
  }, [socket, isConnected, currentJobId, targetIndex, hasExamples, onInputChange, onExampleChange, onAddExample, markUsed]);

  const handleGenerateAI = async () => {
    if (!textSource || !sourceLanguageCode || !targetLanguageCode) {
      toast.error('Please fill in source text and language codes first');
      return;
    }

    setIsGenerating(true);
    try {
      const { jobId } = await generateTextTargetContent({
        textSource,
        sourceLanguageCode,
        targetLanguageCode,
      });
      setCurrentJobId(String(jobId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate content');
      setIsGenerating(false);
    }
  };

  return { isGenerating, isCooldownActive, cooldownRemaining, handleGenerateAI };
}
