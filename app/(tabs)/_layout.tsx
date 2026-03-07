import React from 'react';
import { Tabs } from 'expo-router';
import { FileText, Globe, Clock, User } from 'lucide-react-native';
import { StyleSheet, View, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICONS = [FileText, Globe, Clock, User];

function TabBar({ state, navigation }: any) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const activeColor = isDark ? '#FFFFFF' : '#111111';
  const inactiveColor = isDark ? '#555555' : '#AAAAAA';
  const islandBg = isDark ? 'rgba(28,28,30,0.92)' : 'rgba(255,255,255,0.96)';
  const activePillBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)';
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View
      style={[styles.wrapper, { paddingBottom: bottomPad }]}
      pointerEvents="box-none"
    >
      <View style={[styles.island, { backgroundColor: islandBg }]}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const Icon = ICONS[index] ?? FileText;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tab,
                isFocused && [styles.tabActive, { backgroundColor: activePillBg }],
                pressed && styles.tabPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
            >
              <Icon
                size={26}
                color={isFocused ? activeColor : inactiveColor}
                strokeWidth={isFocused ? 2.2 : 1.7}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="translate" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none' as any,
  },
  island: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 32,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  tab: {
    width: 62,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  tabActive: {
    width: 62,
    height: 48,
    borderRadius: 24,
  },
  tabPressed: {
    opacity: 0.7,
  },
});
