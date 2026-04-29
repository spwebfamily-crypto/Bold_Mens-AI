import { router } from 'expo-router';
import { Check, Sparkles } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { PlanCard } from '@/components/paywall/PlanCard';
import { Button } from '@/components/ui/Button';
import { plans } from '@/constants/plans';
import { colors } from '@/constants/colors';
import { Fonts } from '@/constants/tokens';
import { useSubscription } from '@/hooks/useSubscription';

export default function PaywallScreen() {
  const { buyPlus, restore, isPurchasing } = useSubscription();

  const purchase = async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await buyPlus();
      Alert.alert('PLUS Ativo', 'A tua conta foi atualizada com sucesso. Desfruta do BoldMens PLUS!');
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Compra Indisponível', 'Não foi possível processar a compra neste momento.');
    }
  };

  const restorePurchase = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await restore();
      Alert.alert('Sucesso', 'A tua subscrição foi restaurada.');
    } catch {
      Alert.alert('Erro', 'Não encontrámos nenhuma subscrição ativa.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bmBlack" edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Sparkles size={32} color={colors.gold} />
          </View>
          <Text style={styles.title}>BoldMens PLUS</Text>
          <Text style={styles.subtitle}>A tua melhor versão começa aqui</Text>
        </View>

        <View style={styles.featuresContainer}>
          {plans.plus.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Check size={16} color="black" />
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.planSection}>
          <PlanCard loading={isPurchasing} onPurchase={purchase} />
          <Text style={styles.planDetail}>7 dias grátis, depois 9,99€/mês. Cancela quando quiseres.</Text>
        </View>

        <View style={styles.footer}>
          <Button title="Restaurar Compra" variant="secondary" onPress={restorePurchase} />
          <Pressable 
            style={styles.closeButton} 
            onPress={() => {
              void Haptics.selectionAsync();
              router.back();
            }}
          >
            <Text style={styles.closeButtonText}>Continuar com plano grátis</Text>
          </Pressable>
          <Text style={styles.termsText}>
            Ao assinar, aceitas os nossos Termos de Serviço e Política de Privacidade.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  iconContainer: {
    height: 72,
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  title: {
    marginTop: 20,
    fontSize: 32,
    fontFamily: Fonts.headingBold,
    color: colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 17,
    fontFamily: Fonts.body,
    color: colors.whiteDim,
  },
  featuresContainer: {
    paddingHorizontal: 32,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    marginLeft: 16,
    fontSize: 16,
    fontFamily: Fonts.bodySemiBold,
    color: colors.white,
  },
  planSection: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  planDetail: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: Fonts.body,
    color: colors.whiteDim,
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 24,
    gap: 16,
  },
  closeButton: {
    paddingVertical: 12,
  },
  closeButtonText: {
    textAlign: 'center',
    fontSize: 15,
    fontFamily: Fonts.bodySemiBold,
    color: colors.whiteDim,
  },
  termsText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: Fonts.caption,
    color: colors.whiteDim,
    opacity: 0.6,
  }
});
