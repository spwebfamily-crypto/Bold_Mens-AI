import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { Colors } from '@/constants/tokens';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const status = useAuthStore((state) => state.status);

  if (status === 'idle' || status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  // status === 'anonymous' ou qualquer outro estado
  return <Redirect href="/onboarding" />;
}
