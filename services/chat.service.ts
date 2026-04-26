import { api } from './api';
import type { ChatAssistantResponse } from '@/types';

export async function sendChatMessage(message: string) {
  const response = await api.post<ChatAssistantResponse>('/chat', { message });
  return response.data;
}
