import { Check } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { Fonts } from '@/constants/tokens';

interface FeatureListProps {
  features: string[];
}

export function FeatureList({ features }: FeatureListProps) {
  return (
    <View className="gap-3">
      {features.map((feature) => (
        <View key={feature} className="flex-row items-center gap-3">
          <View className="h-7 w-7 items-center justify-center rounded-full border border-bmGold bg-bmGold/10">
            <Check size={16} color={colors.gold} />
          </View>
          <Text className="flex-1 text-base text-bmWhite" style={{ fontFamily: Fonts.body }}>
            {feature}
          </Text>
        </View>
      ))}
    </View>
  );
}
