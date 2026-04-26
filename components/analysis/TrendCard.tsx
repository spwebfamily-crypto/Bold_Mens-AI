import { Lock, TrendingUp } from 'lucide-react-native';
import { Image, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { Fonts } from '@/constants/tokens';
import type { Trend } from '@/types';

interface TrendCardProps {
  trend: Trend;
  locked?: boolean;
}

export function TrendCard({ trend, locked }: TrendCardProps) {
  return (
    <View className={`rounded-lg border border-bmGold/25 bg-bmDark p-4 ${locked ? 'opacity-55' : ''}`}>
      {trend.mediaUrl ? <Image source={{ uri: trend.mediaUrl }} className="mb-4 h-36 w-full rounded-lg" resizeMode="cover" /> : null}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <TrendingUp size={16} color={colors.gold} />
          <Text className="text-xs font-bold uppercase tracking-widest text-bmGold" style={{ fontFamily: Fonts.bodyBold }}>
            Tendencia 2026
          </Text>
        </View>
        {locked ? <Lock size={16} color={colors.whiteDim} /> : null}
      </View>
      <Text className="mt-3 text-lg font-bold text-bmWhite" style={{ fontFamily: Fonts.headingBold }}>
        {trend.name}
      </Text>
      <Text className="mt-2 text-sm leading-5 text-bmDim" style={{ fontFamily: Fonts.body }}>
        {trend.description}
      </Text>
      <Text className="mt-3 text-xs uppercase text-bmDim" style={{ fontFamily: Fonts.caption }}>
        {trend.idealHairTypes.join(', ')} - {trend.maintenance}
      </Text>
    </View>
  );
}
