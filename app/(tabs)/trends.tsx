import { useQuery } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendCard } from '@/components/analysis/TrendCard';
import { Button } from '@/components/ui/Button';
import { fetchTrends } from '@/services/trends.service';
import { useAuthStore } from '@/stores/authStore';

const lockedTrends = ['Low Taper Curls', 'Flow Cut', 'Buzz Fade Premium', 'Soft Mullet'];

export default function TrendsScreen() {
  const user = useAuthStore((state) => state.user);
  const plan = user?.plan ?? 'free';
  const { data } = useQuery({
    queryKey: ['trends', plan],
    queryFn: fetchTrends,
  });

  return (
    <SafeAreaView className="flex-1 bg-bmBlack" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 py-5">
        <Text className="text-2xl font-bold text-bmWhite">Tendencias Primavera 2026</Text>
        <Text className="mt-1 text-sm text-bmDim">Atualizado semanalmente pela nossa IA</Text>
        <View className="mt-5 gap-3">
          {data?.trends.map((trend) => <TrendCard key={trend.id} trend={trend} />)}
          {plan === 'free'
            ? lockedTrends.map((name) => (
                <View key={name} className="overflow-hidden rounded-lg">
                  <BlurView intensity={20} tint="dark">
                    <TrendCard
                      locked
                      trend={{
                        id: name,
                        name,
                        season: 'Primavera/Verao 2026',
                        description: 'Disponivel no PLUS com analise completa e referencias.',
                        idealHairTypes: ['wavy'],
                        maintenance: 'medium',
                        source: 'BoldMens AI',
                      }}
                    />
                  </BlurView>
                </View>
              ))
            : null}
        </View>
        {plan === 'free' ? (
          <Button className="mt-5" title="Ver todas com PLUS" onPress={() => router.push('/paywall')} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
