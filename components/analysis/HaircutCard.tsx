import { Scissors, Star } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import type { HaircutRecommendation } from '@/types';

interface HaircutCardProps {
  haircut: HaircutRecommendation;
  faceShape: string;
  hairType: string;
}

export function HaircutCard({ haircut, faceShape, hairType }: HaircutCardProps) {
  return (
    <View className="rounded-lg border border-bmGold/50 bg-bmDark p-4">
      <View className="mb-3 flex-row items-center gap-2">
        <Scissors size={18} color={colors.gold} />
        <Text className="text-xs font-bold uppercase tracking-widest text-bmGold">Corte recomendado</Text>
      </View>
      <Text className="text-xl font-bold text-bmWhite">{haircut.name}</Text>
      <View className="mt-2 flex-row items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} size={14} color={colors.gold} fill={colors.gold} />
        ))}
        <Text className="ml-2 text-sm text-bmDim">{haircut.score}% para ti</Text>
      </View>
      <Text className="mt-3 text-sm leading-5 text-bmWhite">{haircut.reason}</Text>
      <Text className="mt-3 text-xs uppercase text-bmDim">
        Rosto {faceShape} · Cabelo {hairType} · Manutencao {haircut.maintenance}
      </Text>
    </View>
  );
}
