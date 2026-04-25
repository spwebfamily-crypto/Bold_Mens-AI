import { Lock, TrendingUp } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import type { Trend } from '@/types';

interface TrendCardProps {
  trend: Trend;
  locked?: boolean;
}

export function TrendCard({ trend, locked }: TrendCardProps) {
  return (
    <View className={`rounded-lg border border-bmGold/25 bg-bmDark p-4 ${locked ? 'opacity-55' : ''}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <TrendingUp size={16} color={colors.gold} />
          <Text className="text-xs font-bold uppercase tracking-widest text-bmGold">Tendencia 2026</Text>
        </View>
        {locked ? <Lock size={16} color={colors.whiteDim} /> : null}
      </View>
      <Text className="mt-3 text-lg font-bold text-bmWhite">{trend.name}</Text>
      <Text className="mt-2 text-sm leading-5 text-bmDim">{trend.description}</Text>
      <Text className="mt-3 text-xs uppercase text-bmDim">
        {trend.idealHairTypes.join(', ')} · {trend.maintenance}
      </Text>
    </View>
  );
}
