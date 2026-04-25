import { useCallback } from 'react';
import { useChatStore } from '@/stores/chatStore';

export function useChat() {
  const store = useChatStore();

  const sendText = useCallback(
    (content: string) => {
      if (!content.trim()) {
        return;
      }

      store.addMessage({
        role: 'user',
        content: content.trim(),
      });

      store.addMessage({
        role: 'assistant',
        content: 'Para recomendações precisas, envia uma selfie com boa luz e cabelo visivel.',
      });
    },
    [store],
  );

  return {
    ...store,
    sendText,
  };
}
