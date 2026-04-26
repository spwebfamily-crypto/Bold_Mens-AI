import { Text, View } from 'react-native';
import { Fonts } from '@/constants/tokens';
import type { ProductRecommendation } from '@/types';

interface ProductCardProps {
  product: ProductRecommendation;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <View className="min-w-56 rounded-lg border border-bmGold/20 bg-bmDark p-4">
      <Text className="text-xs font-bold uppercase tracking-widest text-bmGold" style={{ fontFamily: Fonts.bodyBold }}>
        {product.category}
      </Text>
      <Text className="mt-2 text-base font-semibold text-bmWhite" style={{ fontFamily: Fonts.bodySemiBold }}>
        {product.name}
      </Text>
      <Text className="mt-2 text-sm leading-5 text-bmDim" style={{ fontFamily: Fonts.body }}>
        {product.reason}
      </Text>
    </View>
  );
}
