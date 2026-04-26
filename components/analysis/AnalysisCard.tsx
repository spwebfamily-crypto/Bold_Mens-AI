import { memo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts, Layout, Radius } from '@/constants/tokens';

interface AnalysisCardProps {
  label: string;
  title?: string;
  tags?: string[];
  delay?: number;
  children?: ReactNode;
}

export const AnalysisCard = memo(function AnalysisCard({
  label,
  title,
  tags,
  delay = 0,
  children,
}: AnalysisCardProps) {
  return (
    <View style={[styles.card, delay ? { marginTop: 0 } : null]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
      {tags?.length ? (
        <View style={styles.tags}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Layout.cardPadding,
  },
  label: {
    color: Colors.accent,
    fontFamily: Fonts.caption,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  line: {
    backgroundColor: Colors.accent,
    height: StyleSheet.hairlineWidth,
    marginBottom: 12,
    marginTop: 8,
    width: 32,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: Fonts.headingBold,
    fontSize: 20,
    lineHeight: 28,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: Colors.backgroundMuted,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.caption,
    fontSize: 11,
  },
});
