import { useQuery } from '@tanstack/react-query';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';

interface HistoryItem {
  _id: string;
  imageUrl: string;
  faceShape: string;
  hairType: string;
  recommendations: {
    haircut: {
      name: string;
    };
  };
  createdAt: string;
}

export default function HistoryScreen() {
  const { data } = useQuery({
    queryKey: ['analysis-history'],
    queryFn: async () => {
      const response = await api.get<{ analyses: HistoryItem[]; retentionDays: number }>('/analysis');
      return response.data;
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-bmBlack" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 py-5">
        <Text className="text-2xl font-bold text-bmWhite">Historico</Text>
        <Text className="mt-1 text-sm text-bmDim">
          {data?.retentionDays ? `${data.retentionDays} dias disponiveis no teu plano` : 'Analises recentes'}
        </Text>
        <View className="mt-5 gap-3">
          {data?.analyses?.length ? (
            data.analyses.map((analysis) => (
              <View key={analysis._id} className="flex-row gap-3 rounded-lg border border-bmGold/15 bg-bmDark p-3">
                <Image source={{ uri: analysis.imageUrl }} className="h-20 w-20 rounded-md" />
                <View className="flex-1 justify-center">
                  <Text className="text-base font-semibold text-bmWhite">{analysis.recommendations.haircut.name}</Text>
                  <Text className="mt-1 text-sm text-bmDim">
                    {analysis.faceShape} · {analysis.hairType}
                  </Text>
                  <Text className="mt-1 text-xs text-bmDim">{new Date(analysis.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="mt-8 text-center text-bmDim">As tuas analises aparecem aqui.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
