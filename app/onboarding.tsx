import { router } from 'expo-router';
import { Camera, Scissors, Sparkles } from 'lucide-react-native';
import { FlatList, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

const slides = [
  {
    title: 'Descobre o teu corte ideal',
    body: 'Analise facial e capilar para recomendações pessoais.',
    Icon: Scissors,
  },
  {
    title: 'IA que conhece as tendencias',
    body: 'Cortes atuais, produtos e rotina com o teu estilo em mente.',
    Icon: Sparkles,
  },
  {
    title: '3 analises gratis por dia',
    body: 'FREE para começar. PLUS para uso ilimitado e tendencias completas.',
    Icon: Camera,
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView className="flex-1 bg-bmBlack">
      <View className="flex-1">
        <FlatList
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={slides}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => {
            const Icon = item.Icon;
            return (
              <View style={{ width }} className="items-center justify-center px-8">
                <View className="mb-8 h-28 w-28 items-center justify-center rounded-full border border-bmGold/50 bg-bmDark">
                  <Icon size={44} color={colors.gold} />
                </View>
                <Text className="text-center text-3xl font-bold text-bmWhite">{item.title}</Text>
                <Text className="mt-4 text-center text-base leading-6 text-bmDim">{item.body}</Text>
              </View>
            );
          }}
        />
      </View>
      <View className="gap-3 px-5 pb-6">
        <Button title="Criar conta gratis" onPress={() => router.push('/(auth)/register')} />
        <Button title="Entrar" variant="secondary" onPress={() => router.push('/(auth)/login')} />
      </View>
    </SafeAreaView>
  );
}
