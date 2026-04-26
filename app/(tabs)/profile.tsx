import { router } from 'expo-router';
import { Bell, ChevronRight, Lock, LogOut, Shield } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Fonts } from '@/constants/tokens';
import { useAuth } from '@/hooks/useAuth';
import { usePromptLimit } from '@/hooks/usePromptLimit';
import { useChatStore } from '@/stores/chatStore';

function Row({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <Pressable className="flex-row items-center gap-3 border-b border-bmGold/10 py-4">
      {icon}
      <Text className="flex-1 text-base text-bmWhite" style={{ fontFamily: Fonts.body }}>
        {title}
      </Text>
      <ChevronRight size={18} color={colors.whiteDim} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const usage = useChatStore((state) => state.promptUsage);
  const limit = usePromptLimit(user?.plan ?? 'free', usage);

  const signOut = async () => {
    await logout();
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView className="flex-1 bg-bmBlack" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 py-5">
        <View className="items-center">
          <Avatar name={user?.name} size="lg" />
          <Text className="mt-4 text-2xl font-bold text-bmWhite" style={{ fontFamily: Fonts.headingBold }}>
            {user?.name ?? 'BoldMens User'}
          </Text>
          <Text className="mt-1 text-sm text-bmDim" style={{ fontFamily: Fonts.body }}>
            {user?.email ?? 'Sem email'}
          </Text>
          <View className="mt-3">
            <Badge plan={user?.plan ?? 'free'} />
          </View>
        </View>

        <View className="mt-8 rounded-lg border border-bmGold/15 bg-bmDark p-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-bmGold" style={{ fontFamily: Fonts.bodyBold }}>
            O teu plano
          </Text>
          <Text className="mt-3 text-lg font-semibold text-bmWhite" style={{ fontFamily: Fonts.headingBold }}>
            {user?.plan === 'plus' ? 'Analises ilimitadas' : '3 analises por dia'}
          </Text>
          <Text className="mt-1 text-sm text-bmDim" style={{ fontFamily: Fonts.body }}>
            {limit.label}
          </Text>
          {user?.plan === 'plus' ? (
            <Button className="mt-4" title="Gerir subscricao" variant="secondary" onPress={() => Alert.alert('App Store', 'A gestao abre pela App Store em producao.')} />
          ) : (
            <Button className="mt-4" title="Upgrade para PLUS" onPress={() => router.push('/paywall')} />
          )}
        </View>

        <View className="mt-6">
          <Text className="mb-1 text-xs font-bold uppercase tracking-widest text-bmGold" style={{ fontFamily: Fonts.bodyBold }}>
            Conta
          </Text>
          <Row title="Alterar password" icon={<Lock size={18} color={colors.gold} />} />
          <Row title="Notificacoes" icon={<Bell size={18} color={colors.gold} />} />
          <Row title="Termos e Privacidade" icon={<Shield size={18} color={colors.gold} />} />
        </View>

        <Button
          className="mt-8"
          title="Terminar sessao"
          variant="danger"
          icon={<LogOut size={18} color={colors.white} />}
          onPress={signOut}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
