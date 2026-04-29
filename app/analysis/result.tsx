import { router } from 'expo-router';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';

export default function ResultScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-bmBlack px-5">
      <Text className="text-center text-2xl font-bold text-bmWhite">Resultado guardado no chat</Text>
      <Text className="mt-3 text-center text-base text-bmDim">A analise aparece com texto em streaming e cards de recomendacao.</Text>
      <Button className="mt-8 w-full" title="Voltar ao chat" onPress={() => router.replace('/(tabs)')} />
    </SafeAreaView>
  );
}
