import { Text, View } from 'react-native';

export function LoadingDots() {
  return (
    <View className="flex-row items-center gap-1">
      <Text className="text-xl text-bmGold">.</Text>
      <Text className="text-xl text-bmGold">.</Text>
      <Text className="text-xl text-bmGold">.</Text>
    </View>
  );
}
