import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { Fonts, Layout, Radius } from '@/constants/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-bmGold',
  secondary: 'bg-bmDark border border-bmGold/50',
  ghost: 'bg-transparent',
  danger: 'bg-bmError',
};

const textClass: Record<ButtonVariant, string> = {
  primary: 'text-bmWhite',
  secondary: 'text-bmWhite',
  ghost: 'text-bmGold',
  danger: 'text-bmWhite',
};

export function Button({ title, variant = 'primary', icon, loading, disabled, className, ...props }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? title}
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 rounded ${variantClass[variant]} ${className ?? ''}`}
      style={({ pressed }) => [
        styles.button,
        {
          opacity: isDisabled ? 0.5 : pressed ? 0.82 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
      ]}
      {...props}
    >
      <>
        {loading ? <ActivityIndicator color={variant === 'primary' ? colors.white : colors.white} /> : icon}
        <Text className={`text-sm font-bold uppercase tracking-widest ${textClass[variant]}`} style={styles.text}>
          {title}
        </Text>
      </>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: Layout.buttonHeight,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
  },
  text: {
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.5,
  },
});
