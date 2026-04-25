import { Image, Pressable, Text, View } from 'react-native';

interface ImagePreviewProps {
  uri: string;
  onRemove?: () => void;
}

export function ImagePreview({ uri, onRemove }: ImagePreviewProps) {
  return (
    <View className="relative h-28 w-28 overflow-hidden rounded-lg border border-bmGold/40">
      <Image source={{ uri }} className="h-full w-full" />
      {onRemove ? (
        <Pressable className="absolute right-1 top-1 rounded bg-bmBlack/80 px-2 py-1" onPress={onRemove}>
          <Text className="text-xs font-bold text-bmWhite">X</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
