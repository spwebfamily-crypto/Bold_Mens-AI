import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/tokens';

export function LoadingDots() {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <View style={styles.dot} />
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    height: 16,
  },
  dot: {
    backgroundColor: Colors.textMuted,
    borderRadius: 999,
    height: 6,
    width: 6,
  },
});
