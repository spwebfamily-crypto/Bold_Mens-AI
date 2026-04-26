import { Text, View, StyleSheet } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Colors, Fonts, Layout } from '@/constants/tokens';
import type { Plan } from '@/types';

interface AppHeaderProps {
  eyebrow?: string;
  plan: Plan;
  title?: string;
}

export function AppHeader({ eyebrow = 'Hair Advisor', plan, title = 'BOLDMENS' }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.logo}>{title}</Text>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
      </View>
      <Badge plan={plan} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderBottomColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: Layout.headerHeight - 36,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  logo: {
    color: Colors.textPrimary,
    fontFamily: Fonts.headingBold,
    fontSize: 24,
    letterSpacing: 1.5,
  },
  eyebrow: {
    color: Colors.textMuted,
    fontFamily: Fonts.caption,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
