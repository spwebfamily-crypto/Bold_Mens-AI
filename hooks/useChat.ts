import { useCallback } from 'react';
import { sendChatMessage } from '@/services/chat.service';
import { useChatStore } from '@/stores/chatStore';

export function useChat() {
  const store = useChatStore();

  const sendText = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return;
      }

      store.addMessage({
        role: 'user',
        content: trimmed,
      });

      const assistantId = store.addMessage({
        role: 'assistant',
        content: '',
        isStreaming: true,
      });

      try {
        const response = await sendChatMessage(trimmed);
        store.updateMessage(assistantId, {
          content: response.answer,
          references: response.references,
          isStreaming: false,
        });
      } catch {
        store.updateMessage(assistantId, {
          content: 'Nao consegui ligar a IA agora. Envia uma selfie ou tenta novamente daqui a pouco.',
          isStreaming: false,
        });
      }
    },
    [store],
  );

  return {
    ...store,
    sendText,
  };
}
