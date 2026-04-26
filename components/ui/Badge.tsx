import { Text, View } from 'react-native';
import { Fonts } from '@/constants/tokens';
import type { Plan } from '@/types';

interface BadgeProps {
  plan: Plan;
}

export function Badge({ plan }: BadgeProps) {
  const isPlus = plan === 'plus';

  return (
    <View className={`rounded px-2 py-1 ${isPlus ? 'bg-bmGold' : 'bg-bmDark border border-bmGold/40'}`}>
      <Text
        className={`text-xs font-bold ${isPlus ? 'text-bmWhite' : 'text-bmGold'}`}
        style={{ fontFamily: Fonts.bodyBold, letterSpacing: 1.4 }}
      >
        {isPlus ? 'PLUS' : 'FREE'}
      </Text>
    </View>
  );
}
