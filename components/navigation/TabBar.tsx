import { Pressable, Text, View } from 'react-native';
import { colors } from '@/constants/colors';

export function TabBar({ state, descriptors, navigation }: any) {
  return (
    <View className="flex-row border-t border-bmGold/10 bg-bmBlack px-3 pb-6 pt-2">
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];

        return (
          <Pressable
            key={route.key}
            className="h-12 flex-1 items-center justify-center"
            onPress={() => navigation.navigate(route.name)}
          >
            {options.tabBarIcon?.({ color: focused ? colors.gold : colors.whiteDim, size: 22, focused })}
            <Text className={`mt-1 text-[11px] ${focused ? 'text-bmGold' : 'text-bmDim'}`}>
              {options.title ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
