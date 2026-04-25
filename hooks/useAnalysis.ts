import { useCallback, useState } from 'react';
import { startAnalysis } from '@/services/analysis.service';
import { useChatStore } from '@/stores/chatStore';

export function useAnalysis() {
  const [isAnalyzing, setAnalyzing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const chat = useChatStore();

  const runAnalysis = useCallback(
    async (imageUri: string) => {
      setAnalyzing(true);
      setStatus('preparing');

      chat.addMessage({
        role: 'user',
        content: 'Analisa esta selfie.',
        imageUri,
      });

      const assistantId = chat.addMessage({
        role: 'assistant',
        content: '',
        isStreaming: true,
      });

      try {
        await startAnalysis(imageUri, {
          onStatus: setStatus,
          onDelta: (text) => chat.appendToMessage(assistantId, text),
          onFinal: (result) => {
            chat.completeAnalysisMessage(assistantId, result);
            chat.setPromptUsage({
              ...chat.promptUsage,
              used: chat.promptUsage.used + 1,
            });
          },
        });
      } finally {
        setAnalyzing(false);
        setStatus(null);
      }
    },
    [chat],
  );

  return {
    isAnalyzing,
    status,
    runAnalysis,
  };
}
