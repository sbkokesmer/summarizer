import React from 'react';
import { Tabs } from 'expo-router';
import { FileText, Globe, Clock } from 'lucide-react-native';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = ['index', 'translate', 'history'];
const ICONS = [FileText, Globe, Clock];

function TabBar({ state, navigation }: any) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const activeColor = isDark ? '#FFFFFF' : '#111111';
  const inactiveColor = isDark ? '#484848' : '#BBBBBB';
  const bgColor = isDark ? 'rgba(28,28,30,0.95)' : 'rgba(255,255,255,0.95)';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)';

  return (
    <View style={[styles.outerContainer, { paddingBottom: insets.bottom, backgroundColor: bgColor, borderTopColor: borderColor }]}>
      <View style={styles.inner}>
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
              style={styles.tab}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              hitSlop={{ top: 8, bottom: 8, left: 24, right: 24 }}
            >
              <Icon
                size={26}
                color={isFocused ? activeColor : inactiveColor}
                strokeWidth={isFocused ? 2.2 : 1.6}
              />
              {isFocused && <View style={[styles.activeDot, { backgroundColor: activeColor }]} />}
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
    </Tabs>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    flexDirection: 'row',
    height: 56,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
