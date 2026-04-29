import { router } from 'expo-router';
import { Bell, ChevronRight, Lock, LogOut, Shield, CreditCard } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Fonts, Radius } from '@/constants/tokens';
import { useAuth } from '@/hooks/useAuth';
import { usePromptLimit } from '@/hooks/usePromptLimit';
import { useChatStore } from '@/stores/chatStore';

function Row({ title, icon, isLast }: { title: string; icon: React.ReactNode; isLast?: boolean }) {
  const handlePress = () => {
    void Haptics.selectionAsync();
  };

  return (
    <Pressable 
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
        isLast && styles.rowLast
      ]}
    >
      <View style={styles.iconWrapper}>
        {icon}
      </View>
      <Text style={styles.rowText}>
        {title}
      </Text>
      <ChevronRight size={16} color={colors.whiteDim} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const usage = useChatStore((state) => state.promptUsage);
  const limit = usePromptLimit(user?.plan ?? 'free', usage);

  const signOut = async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await logout();
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView className="flex-1 bg-bmBlack" edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.largeTitle}>Perfil</Text>
        </View>

        <View style={styles.profileSection}>
          <Avatar name={user?.name} size="xl" />
          <Text style={styles.userName}>
            {user?.name ?? 'BoldMens User'}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email ?? 'Sem email'}
          </Text>
          <View style={styles.badgeWrapper}>
            <Badge plan={user?.plan ?? 'free'} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O TEU PLANO</Text>
          <View style={styles.card}>
            <View className="flex-row items-center justify-between mb-2">
              <Text style={styles.cardTitle}>
                {user?.plan === 'plus' ? 'Análises Ilimitadas' : 'Plano Free'}
              </Text>
              <CreditCard size={20} color={colors.gold} />
            </View>
            <Text style={styles.cardText}>
              {limit.label}
            </Text>
            {user?.plan === 'plus' ? (
              <Button 
                className="mt-4" 
                title="Gerir subscrição" 
                variant="secondary" 
                onPress={() => Alert.alert('App Store', 'A gestão abre pela App Store em produção.')} 
              />
            ) : (
              <Button 
                className="mt-4" 
                title="Upgrade para BoldMens PLUS" 
                onPress={() => router.push('/paywall')} 
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONFIGURAÇÕES</Text>
          <View style={styles.listContainer}>
            <Row title="Alterar password" icon={<Lock size={18} color={colors.gold} />} />
            <Row title="Notificações" icon={<Bell size={18} color={colors.gold} />} />
            <Row title="Termos e Privacidade" icon={<Shield size={18} color={colors.gold} />} isLast />
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Terminar sessão"
            variant="ghost"
            className="border border-bmError/30"
            icon={<LogOut size={18} color={colors.error} />}
            onPress={signOut}
          />
          <Text style={styles.versionText}>BoldMens AI v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  largeTitle: {
    fontSize: 34,
    fontFamily: Fonts.headingBold,
    color: colors.white,
    letterSpacing: -1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  userName: {
    marginTop: 16,
    fontSize: 24,
    fontFamily: Fonts.headingBold,
    color: colors.white,
  },
  userEmail: {
    marginTop: 4,
    fontSize: 15,
    fontFamily: Fonts.body,
    color: colors.whiteDim,
  },
  badgeWrapper: {
    marginTop: 12,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.bodySemiBold,
    color: colors.whiteDim,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: Radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Fonts.headingBold,
    color: colors.white,
  },
  cardText: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: colors.whiteDim,
  },
  listContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  rowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconWrapper: {
    width: 32,
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.body,
    color: colors.white,
    marginLeft: 12,
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  versionText: {
    marginTop: 16,
    fontSize: 12,
    fontFamily: Fonts.caption,
    color: colors.whiteDim,
    opacity: 0.5,
  }
});
