import { Pressable, Text, View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { Fonts } from '@/constants/tokens';

export function TabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.container}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 100}
        tint="dark"
        style={styles.blur}
      >
        <View className="flex-row px-3 pb-8 pt-2">
          {state.routes.map((route: any, index: number) => {
            const focused = state.index === index;
            const { options } = descriptors[route.key];

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                accessibilityLabel={options.title ?? route.name}
                accessibilityRole="button"
                key={route.key}
                className="h-12 flex-1 items-center justify-center"
                onPress={onPress}
              >
                <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                  {options.tabBarIcon?.({ 
                    color: focused ? colors.gold : colors.whiteDim, 
                    size: 24, 
                    focused 
                  })}
                </View>
                <Text
                  className={`mt-1 text-[10px] ${focused ? 'text-bmGold' : 'text-bmDim'}`}
                  style={{ 
                    fontFamily: focused ? Fonts.bodySemiBold : Fonts.caption,
                    letterSpacing: 0.2
                  }}
                >
                  {options.title ?? route.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  blur: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(212, 175, 55, 0.15)',
  },
  iconContainer: {
    padding: 4,
    borderRadius: 8,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  }
});
