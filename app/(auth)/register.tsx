import { router } from 'expo-router';
import { Apple, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const { register, signInWithApple, status } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    try {
      await register({ name, email, password });
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Registo falhou', 'Confirma os dados e tenta novamente.');
    }
  };

  const apple = async () => {
    try {
      await signInWithApple();
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Apple Sign In falhou', 'Tenta novamente.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bmBlack">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 px-5">
        <View className="flex-1 justify-center">
          <Text className="text-3xl font-bold text-bmWhite">Criar conta</Text>
          <Text className="mt-2 text-base text-bmDim">Comeca com 3 analises gratis por dia.</Text>
          <View className="mt-8 gap-3">
            <View className="rounded-lg border border-bmGold/20 bg-bmDark px-4">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nome"
                placeholderTextColor={colors.whiteDim}
                className="h-14 text-base text-bmWhite"
              />
            </View>
            <View className="rounded-lg border border-bmGold/20 bg-bmDark px-4">
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Email"
                placeholderTextColor={colors.whiteDim}
                className="h-14 text-base text-bmWhite"
              />
            </View>
            <View className="rounded-lg border border-bmGold/20 bg-bmDark px-4">
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Password"
                placeholderTextColor={colors.whiteDim}
                className="h-14 text-base text-bmWhite"
              />
            </View>
            <Button
              title="Criar conta"
              icon={<UserPlus size={18} color={colors.black} />}
              loading={status === 'loading'}
              onPress={submit}
            />
            <Button title="Sign in with Apple" variant="secondary" icon={<Apple size={18} color={colors.white} />} onPress={apple} />
          </View>
        </View>
        <Pressable className="pb-6" onPress={() => router.push('/(auth)/login')}>
          <Text className="text-center text-sm text-bmDim">
            Ja tens conta? <Text className="font-semibold text-bmGold">Entrar</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
