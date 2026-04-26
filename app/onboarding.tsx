import { router } from 'expo-router';
import { Camera, Scissors, Sparkles } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { FlatList, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Fonts } from '@/constants/tokens';

const slides = [
  {
    title: 'Descobre o teu corte ideal',
    body: 'Analise facial e capilar para recomendacoes pessoais.',
    Icon: Scissors,
  },
  {
    title: 'IA que conhece as tendencias',
    body: 'Cortes atuais, produtos e rotina com o teu estilo em mente.',
    Icon: Sparkles,
  },
  {
    title: 'Comeca gratis hoje',
    body: 'FREE para comecar. PLUS para uso ilimitado, fotos e referencias completas.',
    Icon: Camera,
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<(typeof slides)[number]>>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === slides.length - 1;

  const continueFlow = () => {
    if (isLast) {
      router.push('/(auth)/register');
      return;
    }

    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <SafeAreaView className="flex-1 bg-bmBlack">
      <View className="flex-1">
        <FlatList
          ref={listRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={slides}
          keyExtractor={(item) => item.title}
          onMomentumScrollEnd={(event) => setIndex(Math.round(event.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => {
            const Icon = item.Icon;
            return (
              <View style={{ width }} className="items-center justify-center px-8">
                <View className="mb-8 h-28 w-28 items-center justify-center rounded-full border border-bmGold/50 bg-bmDark">
                  <Icon size={44} color={colors.gold} />
                </View>
                <Text className="text-center text-3xl font-bold text-bmWhite" style={{ fontFamily: Fonts.headingBold }}>
                  {item.title}
                </Text>
                <Text className="mt-4 text-center text-base leading-6 text-bmDim" style={{ fontFamily: Fonts.body }}>
                  {item.body}
                </Text>
              </View>
            );
          }}
        />
      </View>
      <View className="px-5 pb-6">
        <View className="mb-6 flex-row justify-center gap-2">
          {slides.map((slide, slideIndex) => (
            <View key={slide.title} className={`h-1.5 rounded-full ${slideIndex === index ? 'w-8 bg-bmGold' : 'w-4 bg-bmMuted'}`} />
          ))}
        </View>
        <View className="gap-3">
          <Button title={isLast ? 'Criar conta gratis' : 'Continuar'} onPress={continueFlow} />
          {isLast ? (
            <Button title="Entrar" variant="secondary" onPress={() => router.push('/(auth)/login')} />
          ) : (
            <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/register')}>
              <Text className="py-3 text-center text-sm font-semibold text-bmDim" style={{ fontFamily: Fonts.bodySemiBold }}>
                Saltar
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
