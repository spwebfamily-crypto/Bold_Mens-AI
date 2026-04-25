import { Text, View } from 'react-native';

interface PromptCounterProps {
  label: string;
  blocked?: boolean;
}

export function PromptCounter({ label, blocked }: PromptCounterProps) {
  return (
    <View className={`self-center rounded-md px-3 py-1 ${blocked ? 'bg-bmError/15' : 'bg-bmDark'}`}>
      <Text className={`text-xs font-medium ${blocked ? 'text-bmError' : 'text-bmDim'}`}>{label}</Text>
    </View>
  );
}
