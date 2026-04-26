import { Text, View } from 'react-native';
import { AnalysisCard } from '@/components/analysis/AnalysisCard';
import { Fonts } from '@/constants/tokens';
import type { FaceAnalysis } from '@/types';

interface FaceAnalysisCardProps {
  faceShape: string;
  faceAnalysis: FaceAnalysis;
}

const confidenceLabel: Record<FaceAnalysis['confidence'], string> = {
  high: 'alta',
  medium: 'media',
  low: 'baixa',
};

export function FaceAnalysisCard({ faceShape, faceAnalysis }: FaceAnalysisCardProps) {
  return (
    <AnalysisCard
      label="Visagismo"
      title={`Rosto ${faceShape}`}
      tags={[`Confianca ${confidenceLabel[faceAnalysis.confidence]}`]}
    >
      <View className="mt-3 gap-2">
        <Text className="text-sm leading-5 text-bmWhite" style={{ fontFamily: Fonts.body }}>
          {faceAnalysis.proportions}
        </Text>
        <Text className="text-sm leading-5 text-bmDim" style={{ fontFamily: Fonts.body }}>
          Testa: {faceAnalysis.forehead}
        </Text>
        <Text className="text-sm leading-5 text-bmDim" style={{ fontFamily: Fonts.body }}>
          Macas: {faceAnalysis.cheekbones}
        </Text>
        <Text className="text-sm leading-5 text-bmDim" style={{ fontFamily: Fonts.body }}>
          Mandibula: {faceAnalysis.jawline}
        </Text>
        <Text className="text-sm leading-5 text-bmDim" style={{ fontFamily: Fonts.body }}>
          Barba: {faceAnalysis.facialHair}
        </Text>
      </View>
      <View className="mt-3 gap-1">
        {faceAnalysis.visagismNotes.slice(0, 3).map((note) => (
          <Text key={note} className="text-sm leading-5 text-bmWhite" style={{ fontFamily: Fonts.body }}>
            - {note}
          </Text>
        ))}
      </View>
    </AnalysisCard>
  );
}
