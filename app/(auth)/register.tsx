import { router } from 'expo-router';
import { Apple, Mail, Lock, User, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Fonts, Radius } from '@/constants/tokens';
import { useAuth } from '@/hooks/useAuth';
import { getAuthErrorMessage } from '@/services/auth.service';

export default function RegisterScreen() {
  const { register, signInWithApple, status } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | null>(null);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert('Nome em falta', 'Por favor, introduz o teu nome.');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Email inválido', 'Por favor, introduz um endereço de email válido.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Password fraca', 'A password deve ter pelo menos 8 caracteres.');
      return;
    }

    try {
      await register({ name: name.trim(), email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Erro ao criar conta', getAuthErrorMessage(error, 'Confirma os teus dados e tenta novamente.'));
    }
  };

  const apple = async () => {
    try {
      await signInWithApple();
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Apple Sign In', 'Não foi possível autenticar com a Apple.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bmBlack">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 px-8">
        <View className="flex-1 justify-center">
          <View className="mb-10">
            <Text className="text-4xl font-bold text-bmWhite tracking-tight" style={{ fontFamily: Fonts.headingBold }}>
              Criar conta
            </Text>
            <Text className="mt-2 text-lg text-bmDim leading-6" style={{ fontFamily: Fonts.body }}>
              Junta-te à elite e começa hoje a tua transformação de estilo.
            </Text>
          </View>

          <View className="gap-4">
            <View 
              style={[
                styles.inputContainer, 
                focusedField === 'name' && styles.inputContainerFocused
              ]}
            >
              <User size={20} color={focusedField === 'name' ? colors.gold : colors.whiteDim} />
              <TextInput
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                autoComplete="name"
                placeholder="Nome completo"
                placeholderTextColor={colors.whiteDim}
                className="flex-1 h-14 ml-3 text-base text-bmWhite"
                style={{ fontFamily: Fonts.body }}
              />
            </View>

            <View 
              style={[
                styles.inputContainer, 
                focusedField === 'email' && styles.inputContainerFocused
              ]}
            >
              <Mail size={20} color={focusedField === 'email' ? colors.gold : colors.whiteDim} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                placeholder="Email"
                placeholderTextColor={colors.whiteDim}
                className="flex-1 h-14 ml-3 text-base text-bmWhite"
                style={{ fontFamily: Fonts.body }}
              />
            </View>

            <View 
              style={[
                styles.inputContainer, 
                focusedField === 'password' && styles.inputContainerFocused
              ]}
            >
              <Lock size={20} color={focusedField === 'password' ? colors.gold : colors.whiteDim} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                placeholder="Password (mín. 8 caracteres)"
                placeholderTextColor={colors.whiteDim}
                className="flex-1 h-14 ml-3 text-base text-bmWhite"
                style={{ fontFamily: Fonts.body }}
              />
            </View>

            <View className="mt-4 gap-4">
              <Button
                title="Criar conta"
                icon={<UserPlus size={20} color="black" />}
                loading={status === 'loading'}
                disabled={status === 'loading'}
                onPress={submit}
              />
              
              <View className="flex-row items-center my-2">
                <View className="flex-1 h-[1px] bg-bmWhite/10" />
                <Text className="mx-4 text-xs text-bmDim uppercase tracking-widest" style={{ fontFamily: Fonts.caption }}>ou</Text>
                <View className="flex-1 h-[1px] bg-bmWhite/10" />
              </View>

              <Button 
                title="Continuar com Apple" 
                variant="secondary" 
                icon={<Apple size={20} color={colors.white} />} 
                onPress={apple} 
              />
            </View>
          </View>
        </View>

        <Pressable className="pb-8" onPress={() => router.push('/(auth)/login')}>
          <Text className="text-center text-sm text-bmDim" style={{ fontFamily: Fonts.body }}>
            Já tens conta? <Text className="font-semibold text-bmGold">Entrar</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: 'rgba(212, 175, 55, 0.5)',
    backgroundColor: '#2C2C2E',
  }
});
