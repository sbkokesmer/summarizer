import React from 'react';
import { Tabs } from 'expo-router';
import { FileText, Globe, Clock, User } from 'lucide-react-native';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICONS = [FileText, Globe, Clock, User];

function TabBar({ state, navigation }: any) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const activeColor = isDark ? '#FFFFFF' : '#111111';
  const inactiveColor = isDark ? '#555555' : '#AAAAAA';
  const islandBg = isDark ? 'rgba(28,28,30,0.75)' : 'rgba(255,255,255,0.75)';
  const activePillBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)';

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 32) }]}>
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
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tab, isFocused && [styles.tabActive, { backgroundColor: activePillBg }]]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <Icon
                size={26}
                color={isFocused ? activeColor : inactiveColor}
                strokeWidth={isFocused ? 2.2 : 1.7}
              />
            </TouchableOpacity>
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
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
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
    paddingBottom: 84,
    backgroundColor: 'transparent',
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
    shadowOpacity: 0.15,
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
});
