import { ExternalLink } from 'lucide-react-native';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts, Radius } from '@/constants/tokens';
import type { ReferenceImage } from '@/types';

interface ReferenceStripProps {
  references?: ReferenceImage[];
}

export function ReferenceStrip({ references }: ReferenceStripProps) {
  if (!references?.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>REFERENCIAS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {references.map((reference) => (
          <Pressable
            accessibilityLabel={`Abrir referencia ${reference.title}`}
            accessibilityRole="button"
            key={`${reference.title}-${reference.imageUrl}`}
            style={styles.card}
            onPress={() => {
              if (reference.sourceUrl.startsWith('https://')) {
                void Linking.openURL(reference.sourceUrl);
              }
            }}
          >
            <Image source={{ uri: reference.imageUrl }} style={styles.image} resizeMode="cover" />
            <View style={styles.body}>
              <Text numberOfLines={1} style={styles.title}>
                {reference.title}
              </Text>
              <View style={styles.sourceRow}>
                <Text numberOfLines={1} style={styles.source}>
                  {reference.sourceName}
                </Text>
                <ExternalLink size={12} color={Colors.textMuted} />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginTop: 12,
    width: '100%',
  },
  label: {
    color: Colors.accent,
    fontFamily: Fonts.caption,
    fontSize: 10,
    letterSpacing: 2,
  },
  list: {
    gap: 10,
    paddingRight: 18,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    width: 154,
  },
  image: {
    backgroundColor: Colors.backgroundMuted,
    height: 112,
    width: '100%',
  },
  body: {
    gap: 4,
    padding: 10,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
  },
  source: {
    color: Colors.textMuted,
    flex: 1,
    fontFamily: Fonts.caption,
    fontSize: 11,
  },
  sourceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
});
