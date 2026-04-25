import { Text, View } from 'react-native';
import type { Plan } from '@/types';

interface BadgeProps {
  plan: Plan;
}

export function Badge({ plan }: BadgeProps) {
  const isPlus = plan === 'plus';

  return (
    <View className={`rounded-md px-2 py-1 ${isPlus ? 'bg-bmGold' : 'bg-bmDark border border-bmGold/40'}`}>
      <Text className={`text-xs font-bold ${isPlus ? 'text-bmBlack' : 'text-bmGold'}`}>
        {isPlus ? 'PLUS' : 'FREE'}
      </Text>
    </View>
  );
}
