import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { Fonts, Radius } from '@/constants/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-bmGold',
  secondary: 'bg-bmDark border border-bmGold/30',
  ghost: 'bg-transparent',
  danger: 'bg-bmError',
};

const textClass: Record<ButtonVariant, string> = {
  primary: 'text-black', // Preto no dourado para melhor leitura
  secondary: 'text-bmWhite',
  ghost: 'text-bmGold',
  danger: 'text-bmWhite',
};

export function Button({ title, variant = 'primary', icon, loading, disabled, className, ...props }: ButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = (e: any) => {
    if (!isDisabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      props.onPress?.(e);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? title}
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 ${variantClass[variant]} ${className ?? ''}`}
      style={({ pressed }) => [
        styles.button,
        {
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.97 : 1 }],
        },
      ]}
      onPress={handlePress}
      {...props}
    >
      <>
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#000000' : colors.white} />
        ) : (
          icon
        )}
        <Text className={`text-base font-semibold ${textClass[variant]}`} style={styles.text}>
          {title}
        </Text>
      </>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52, // Altura padrão Apple
    borderRadius: Radius.md,
    paddingHorizontal: 20,
  },
  text: {
    fontFamily: Fonts.bodySemiBold,
    letterSpacing: -0.3, // Tracking mais fechado estilo SF Pro
  },
});
