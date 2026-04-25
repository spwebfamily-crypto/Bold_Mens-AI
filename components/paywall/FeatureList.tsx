import { Check } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { colors } from '@/constants/colors';

interface FeatureListProps {
  features: string[];
}

export function FeatureList({ features }: FeatureListProps) {
  return (
    <View className="gap-3">
      {features.map((feature) => (
        <View key={feature} className="flex-row items-center gap-3">
          <Check size={18} color={colors.success} />
          <Text className="flex-1 text-base text-bmWhite">{feature}</Text>
        </View>
      ))}
    </View>
  );
}
