import { Crown } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { Fonts } from '@/constants/tokens';

interface PlanCardProps {
  onPurchase: () => void;
  loading?: boolean;
}

export function PlanCard({ onPurchase, loading }: PlanCardProps) {
  return (
    <View className="rounded-lg border border-bmGold bg-bmDark p-5">
      <View className="flex-row items-center gap-2">
        <Crown size={20} color={colors.gold} />
        <Text className="text-xl font-bold text-bmGold" style={{ fontFamily: Fonts.headingBold }}>
          9,99 EUR / mes
        </Text>
      </View>
      <Text className="mt-2 text-sm text-bmDim" style={{ fontFamily: Fonts.body }}>
        7 dias gratis. Cancela quando quiseres.
      </Text>
      <Button className="mt-5" title="Comecar PLUS" loading={loading} onPress={onPurchase} />
    </View>
  );
}
