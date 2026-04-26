import { router } from 'expo-router';
import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { AppHeader } from '@/components/navigation/AppHeader';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useChat } from '@/hooks/useChat';
import { usePromptLimit } from '@/hooks/usePromptLimit';
import { useAuthStore } from '@/stores/authStore';

export default function ChatScreen() {
  const user = useAuthStore((state) => state.user);
  const { messages, promptUsage, sendText } = useChat();
  const { runAnalysis } = useAnalysis();
  const plan = user?.plan ?? 'free';
  const promptLimit = usePromptLimit(plan, promptUsage);
  const sortedMessages = useMemo(() => messages, [messages]);

  return (
    <SafeAreaView className="flex-1 bg-bmBlack" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <AppHeader plan={plan} />

        <ScrollView className="flex-1" contentContainerClassName="gap-5 px-4 py-5">
          {sortedMessages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        <ChatInput
          promptLabel={promptLimit.label}
          blocked={promptLimit.isBlocked}
          onSendText={sendText}
          onImagePicked={(uri) => void runAnalysis(uri)}
          onUpgrade={() => router.push('/paywall')}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
