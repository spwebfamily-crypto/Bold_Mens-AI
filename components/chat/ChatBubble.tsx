import { Image, ScrollView, Text, View } from 'react-native';
import { HaircutCard } from '@/components/analysis/HaircutCard';
import { HairTypeCard } from '@/components/analysis/HairTypeCard';
import { ProductCard } from '@/components/analysis/ProductCard';
import { TrendCard } from '@/components/analysis/TrendCard';
import type { ChatMessage } from '@/types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View className={`w-full ${isUser ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[86%] rounded-lg px-4 py-3 ${
          isUser ? 'bg-bmGold' : 'border border-bmGold/10 bg-bmDark'
        }`}
      >
        {message.imageUri ? <Image source={{ uri: message.imageUri }} className="mb-3 h-56 w-56 rounded-lg" /> : null}
        {message.content ? (
          <Text className={`text-base leading-6 ${isUser ? 'text-bmBlack' : 'text-bmWhite'}`}>
            {message.content}
          </Text>
        ) : null}
        {message.isStreaming ? <Text className="text-lg text-bmGold">...</Text> : null}
      </View>

      {message.result ? (
        <View className="mt-3 w-full gap-3">
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
    </View>
  );
}
