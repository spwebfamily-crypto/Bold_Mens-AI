import { Text, View } from 'react-native';
import type { HairCondition, HairType } from '@/types';

interface HairTypeCardProps {
  hairType: HairType;
  condition: HairCondition;
}

export function HairTypeCard({ hairType, condition }: HairTypeCardProps) {
  return (
    <View className="rounded-lg border border-bmGold/25 bg-bmDark p-4">
      <Text className="text-xs font-bold uppercase tracking-widest text-bmGold">Cabelo</Text>
      <View className="mt-3 flex-row gap-3">
        <View className="flex-1 rounded-md bg-bmBlack p-3">
          <Text className="text-xs text-bmDim">Tipo</Text>
          <Text className="mt-1 text-base font-semibold text-bmWhite">{hairType}</Text>
        </View>
        <View className="flex-1 rounded-md bg-bmBlack p-3">
          <Text className="text-xs text-bmDim">Condicao</Text>
          <Text className="mt-1 text-base font-semibold text-bmWhite">{condition}</Text>
        </View>
      </View>
    </View>
  );
}
