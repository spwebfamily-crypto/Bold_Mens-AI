import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const status = useAuthStore((state) => state.status);

  if (status === 'idle' || status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-bmBlack">
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
