import { Text, View } from 'react-native';
import { Fonts } from '@/constants/tokens';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-20 w-20',
};

const textClass = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-3xl',
};

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase() || 'B';

  return (
    <View className={`${sizeClass[size]} items-center justify-center rounded-full border border-bmGold bg-bmGold/10`}>
      <Text className={`${textClass[size]} font-bold text-bmGold`} style={{ fontFamily: Fonts.headingBold }}>
        {initial}
      </Text>
    </View>
  );
}
