import { View } from 'react-native';
import { LoadingDots } from '@/components/ui/LoadingDots';

export function TypingIndicator() {
  return (
    <View className="self-start rounded-lg bg-bmDark px-4 py-3">
      <LoadingDots />
    </View>
  );
}
