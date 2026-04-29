import { useQuery } from '@tanstack/react-query';
import { Image, ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { api } from '@/services/api';
import { Fonts, Radius } from '@/constants/tokens';
import { colors } from '@/constants/colors';

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

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView className="flex-1 bg-bmBlack" edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.largeTitle}>Histórico</Text>
          <Text style={styles.subtitle}>
            {data?.retentionDays ? `${data.retentionDays} dias disponíveis no teu plano` : 'As tuas análises recentes'}
          </Text>
        </View>

        <View style={styles.container}>
          {data?.analyses?.length ? (
            data.analyses.map((analysis) => (
              <Pressable 
                key={analysis._id} 
                onPress={handlePress}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed
                ]}
              >
                <Image source={{ uri: analysis.imageUrl }} style={styles.image} />
                <View style={styles.cardContent}>
                  <Text style={styles.haircutName}>{analysis.recommendations.haircut.name}</Text>
                  <Text style={styles.details}>
                    {analysis.faceShape} • {analysis.hairType}
                  </Text>
                  <Text style={styles.date}>
                    {new Date(analysis.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long' })}
                  </Text>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>As tuas análises aparecerão aqui.</Text>
            </View>
          )}
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
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    fontFamily: Fonts.body,
    color: colors.whiteDim,
  },
  container: {
    paddingHorizontal: 24,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
  },
  cardPressed: {
    backgroundColor: '#2C2C2E',
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  image: {
    height: 80,
    width: 80,
    borderRadius: Radius.md,
    backgroundColor: '#2C2C2E',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  haircutName: {
    fontSize: 17,
    fontFamily: Fonts.bodySemiBold,
    color: colors.white,
    letterSpacing: -0.2,
  },
  details: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: Fonts.body,
    color: colors.whiteDim,
  },
  date: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: Fonts.caption,
    color: colors.gold,
    opacity: 0.8,
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.body,
    color: colors.whiteDim,
    textAlign: 'center',
  }
});
