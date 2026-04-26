import { Text, View } from 'react-native';
import { AnalysisCard } from '@/components/analysis/AnalysisCard';
import { Fonts } from '@/constants/tokens';
import type { HairCondition, HairType } from '@/types';

interface HairTypeCardProps {
  hairType: HairType;
  condition: HairCondition;
}

export function HairTypeCard({ hairType, condition }: HairTypeCardProps) {
  return (
    <AnalysisCard label="Cabelo" title="Leitura tecnica" delay={100}>
      <View className="mt-3 flex-row gap-3">
        <View className="flex-1 rounded bg-bmBlack p-3">
          <Text className="text-xs text-bmDim" style={{ fontFamily: Fonts.caption }}>
            Tipo
          </Text>
          <Text className="mt-1 text-base font-semibold text-bmWhite" style={{ fontFamily: Fonts.bodySemiBold }}>
            {hairType}
          </Text>
        </View>
        <View className="flex-1 rounded bg-bmBlack p-3">
          <Text className="text-xs text-bmDim" style={{ fontFamily: Fonts.caption }}>
            Condicao
          </Text>
          <Text className="mt-1 text-base font-semibold text-bmWhite" style={{ fontFamily: Fonts.bodySemiBold }}>
            {condition}
          </Text>
        </View>
      </View>
    </AnalysisCard>
  );
}
