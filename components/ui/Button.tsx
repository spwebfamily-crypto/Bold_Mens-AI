import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { colors } from '@/constants/colors';

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
  primary: 'text-bmBlack',
  secondary: 'text-bmWhite',
  ghost: 'text-bmGold',
  danger: 'text-bmWhite',
};

export function Button({ title, variant = 'primary', icon, loading, disabled, className, ...props }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`min-h-12 flex-row items-center justify-center gap-2 rounded-lg px-4 ${variantClass[variant]} ${
        isDisabled ? 'opacity-50' : 'opacity-100'
      } ${className ?? ''}`}
      {...props}
    >
      {loading ? <ActivityIndicator color={variant === 'primary' ? colors.black : colors.white} /> : icon}
      <Text className={`text-base font-semibold ${textClass[variant]}`}>{title}</Text>
    </Pressable>
  );
}
