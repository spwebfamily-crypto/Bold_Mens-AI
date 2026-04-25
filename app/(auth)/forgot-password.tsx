import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bmBlack px-5">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-bmWhite">Recuperar password</Text>
        <Text className="mt-3 text-base leading-6 text-bmDim">
          Receberas instrucoes no email associado a tua conta quando este fluxo estiver ativo.
        </Text>
        <Button className="mt-8" title="Voltar ao login" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}
