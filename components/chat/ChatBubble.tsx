import { Image, ScrollView, Text, View } from 'react-native';
import { FaceAnalysisCard } from '@/components/analysis/FaceAnalysisCard';
import { HaircutCard } from '@/components/analysis/HaircutCard';
import { HairTypeCard } from '@/components/analysis/HairTypeCard';
import { ProductCard } from '@/components/analysis/ProductCard';
import { TrendCard } from '@/components/analysis/TrendCard';
import { ReferenceStrip } from '@/components/chat/ReferenceStrip';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import type { ChatMessage } from '@/types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const references = message.references ?? message.result?.references;

  return (
    <View className={`w-full ${isUser ? 'items-end' : 'items-start'}`}>
      {message.isStreaming && !message.content ? (
        <TypingIndicator />
      ) : (
        <View
          className={`max-w-[86%] px-4 py-3 ${
            isUser
              ? 'rounded-bl-lg rounded-tl-lg rounded-tr-sm bg-bmGold'
              : 'rounded-bl-lg rounded-br-lg rounded-tr-lg border border-bmGold/10 bg-bmDark'
          }`}
        >
          {message.imageUri ? <Image source={{ uri: message.imageUri }} className="mb-3 h-52 w-52 rounded-lg" /> : null}
          {message.content ? (
            <Text className={`text-[15px] leading-6 ${isUser ? 'font-semibold text-bmWhite' : 'text-bmWhite'}`}>
              {message.content}
            </Text>
          ) : null}
          {message.isStreaming ? <Text className="text-lg text-bmGold">...</Text> : null}
        </View>
      )}

      {message.result ? (
        <View className="mt-3 w-full gap-3">
          {message.result.faceAnalysis ? (
            <FaceAnalysisCard faceShape={message.result.faceShape} faceAnalysis={message.result.faceAnalysis} />
          ) : null}
          <HaircutCard
            haircut={message.result.recommendations.haircut}
            faceShape={message.result.faceShape}
            hairType={message.result.hairType}
          />
          <HairTypeCard hairType={message.result.hairType} condition={message.result.hairCondition} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3">
            {message.result.recommendations.products.map((product) => (
              <ProductCard key={product.name} product={product} />
            ))}
          </ScrollView>
          <TrendCard trend={message.result.trends[0]} />
        </View>
      ) : null}
      <ReferenceStrip references={references} />
    </View>
  );
}
