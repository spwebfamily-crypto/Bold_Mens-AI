import { router } from 'expo-router';
import { Scissors } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeatureList } from '@/components/paywall/FeatureList';
import { PlanCard } from '@/components/paywall/PlanCard';
import { Button } from '@/components/ui/Button';
import { plans } from '@/constants/plans';
import { colors } from '@/constants/colors';
import { Fonts } from '@/constants/tokens';
import { useSubscription } from '@/hooks/useSubscription';

export default function PaywallScreen() {
  const { buyPlus, restore, isPurchasing } = useSubscription();

  const purchase = async () => {
    try {
      await buyPlus();
      Alert.alert('PLUS ativo', 'A tua conta foi atualizada.');
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Compra indisponivel', 'Configura o produto RevenueCat com o ID com.boldmens.plus.monthly.');
    }
  };

  const restorePurchase = async () => {
    try {
      await restore();
      Alert.alert('Compra restaurada', 'O estado da subscricao foi sincronizado.');
    } catch {
      Alert.alert('Restauro falhou', 'Tenta novamente mais tarde.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bmBlack" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 py-6">
        <View className="items-center">
          <View className="h-16 w-16 items-center justify-center rounded-full border border-bmGold bg-bmDark">
            <Scissors size={30} color={colors.gold} />
          </View>
          <Text className="mt-5 text-center text-3xl font-bold text-bmWhite" style={{ fontFamily: Fonts.headingBold }}>
            BoldMens PLUS
          </Text>
          <View className="mt-3 h-px w-16 bg-bmGold" />
          <Text className="mt-3 text-center text-base text-bmDim" style={{ fontFamily: Fonts.body }}>
            Desbloqueia o teu potencial
          </Text>
        </View>

        <View className="mt-8">
          <FeatureList features={plans.plus.features} />
        </View>

        <View className="mt-8">
          <PlanCard loading={isPurchasing} onPurchase={purchase} />
        </View>

        <View className="mt-5 gap-3">
          <Button title="Restaurar compra" variant="secondary" onPress={restorePurchase} />
          <Pressable onPress={() => router.back()}>
            <Text className="text-center text-sm font-semibold text-bmDim" style={{ fontFamily: Fonts.bodySemiBold }}>
              Continuar gratis
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
