import { Scissors, Star } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { AnalysisCard } from '@/components/analysis/AnalysisCard';
import { colors } from '@/constants/colors';
import { Fonts } from '@/constants/tokens';
import type { HaircutRecommendation } from '@/types';

interface HaircutCardProps {
  haircut: HaircutRecommendation;
  faceShape: string;
  hairType: string;
}

export function HaircutCard({ haircut, faceShape, hairType }: HaircutCardProps) {
  return (
    <AnalysisCard
      label="Corte recomendado"
      title={haircut.name}
      tags={[`Rosto ${faceShape}`, `Cabelo ${hairType}`, `Manutencao ${haircut.maintenance}`]}
    >
      <View className="mt-3 flex-row items-center gap-2">
        <Scissors size={18} color={colors.gold} />
        <Text className="text-xs font-bold uppercase tracking-widest text-bmGold" style={{ fontFamily: Fonts.bodyBold }}>
          Match {haircut.score}%
        </Text>
      </View>
      <View className="mt-2 flex-row items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} size={14} color={colors.gold} fill={colors.gold} />
        ))}
        <Text className="ml-2 text-sm text-bmDim" style={{ fontFamily: Fonts.body }}>
          {haircut.score}% para ti
        </Text>
      </View>
      <Text className="mt-3 text-sm leading-5 text-bmWhite" style={{ fontFamily: Fonts.body }}>
        {haircut.reason}
      </Text>
    </AnalysisCard>
  );
}
