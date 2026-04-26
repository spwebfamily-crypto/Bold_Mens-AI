import { create } from 'zustand';
import type { AnalysisResult, ChatMessage, PromptUsage } from '@/types';

interface ChatState {
  messages: ChatMessage[];
  promptUsage: PromptUsage;
  addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'> & { id?: string }) => string;
  appendToMessage: (id: string, text: string) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  completeAnalysisMessage: (id: string, result: AnalysisResult) => void;
  setPromptUsage: (usage: PromptUsage) => void;
  clearChat: () => void;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Envia uma selfie e eu digo-te o corte, rotina e tendencias que fazem sentido para ti.',
      createdAt: new Date().toISOString(),
    },
  ],
  promptUsage: {
    used: 0,
    limit: 3,
  },
  addMessage: (message) => {
    const id = message.id ?? createId();
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    return id;
  },
  appendToMessage: (id, text) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, content: `${message.content}${text}` } : message,
      ),
    })),
  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((message) => (message.id === id ? { ...message, ...patch } : message)),
    })),
  completeAnalysisMessage: (id, result) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, result, references: result.references, isStreaming: false } : message,
      ),
    })),
  setPromptUsage: (usage) => set({ promptUsage: usage }),
  clearChat: () =>
    set({
      messages: [],
      promptUsage: {
        used: 0,
        limit: 3,
      },
    }),
}));
