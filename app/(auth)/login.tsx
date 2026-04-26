import { router } from 'expo-router';
import { Apple, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Fonts } from '@/constants/tokens';
import { useAuth } from '@/hooks/useAuth';
import { getAuthErrorMessage } from '@/services/auth.service';

export default function LoginScreen() {
  const { login, signInWithApple, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Dados incompletos', 'Preenche o email e a password.');
      return;
    }

    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login falhou', getAuthErrorMessage(error, 'Confirma o email e a password.'));
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
          <Text className="text-3xl font-bold text-bmWhite" style={{ fontFamily: Fonts.headingBold }}>
            Entrar
          </Text>
          <Text className="mt-2 text-base text-bmDim" style={{ fontFamily: Fonts.body }}>
            Continua para a tua conta BoldMens AI.
          </Text>
          <View className="mt-8 gap-3">
            <View className="rounded-lg border border-bmGold/20 bg-bmDark px-4">
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                placeholder="Email"
                placeholderTextColor={colors.whiteDim}
                className="h-14 text-base text-bmWhite"
                style={{ fontFamily: Fonts.body }}
              />
            </View>
            <View className="rounded-lg border border-bmGold/20 bg-bmDark px-4">
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                placeholder="Password"
                placeholderTextColor={colors.whiteDim}
                className="h-14 text-base text-bmWhite"
                style={{ fontFamily: Fonts.body }}
              />
            </View>
            <Button
              title="Entrar"
              icon={<Mail size={18} color={colors.white} />}
              loading={status === 'loading'}
              disabled={status === 'loading'}
              onPress={submit}
            />
            <Button title="Sign in with Apple" variant="secondary" icon={<Apple size={18} color={colors.white} />} onPress={apple} />
            <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
              <Text className="text-center text-sm font-semibold text-bmGold" style={{ fontFamily: Fonts.bodySemiBold }}>
                Esqueci-me da password
              </Text>
            </Pressable>
          </View>
        </View>
        <Pressable className="pb-6" onPress={() => router.push('/(auth)/register')}>
          <Text className="text-center text-sm text-bmDim" style={{ fontFamily: Fonts.body }}>
            Ainda nao tens conta? <Text className="font-semibold text-bmGold">Criar conta</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
