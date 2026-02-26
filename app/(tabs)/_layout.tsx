import React from 'react';
import { Tabs } from 'expo-router';
import { FileText, Globe, Clock } from 'lucide-react-native';
import { useColorScheme, StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function SmartDock({ state, descriptors, navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  // Soft fade gradient from transparent to the theme's background color
  const fadeColors = [
    'transparent',
    isDark ? 'rgba(11,11,11,0.8)' : 'rgba(255,255,255,0.8)',
    isDark ? '#0B0B0B' : '#FFFFFF'
  ];

  return (
    <View style={styles.dockWrapper}>
      {/* Soft fade gradient from content into dock area */}
      <LinearGradient
        colors={fadeColors}
        style={[styles.fadeGradient, { height: insets.bottom + 120 }]}
        pointerEvents="none"
      />
      
      {/* Floating Dock */}
      <View style={[styles.dockContainer, { paddingBottom: Platform.OS === 'ios' ? insets.bottom : 24 }]}>
        <BlurView
          intensity={isDark ? 25 : 35}
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.dock,
            {
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
              backgroundColor: isDark ? 'rgba(28,28,30,0.4)' : 'rgba(255,255,255,0.4)',
            }
          ]}
        >
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

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

            // Determine Icon based on route name
            let Icon = FileText;
            if (route.name === 'translate') Icon = Globe;
            if (route.name === 'history') Icon = Clock;

            const activeColor = isDark ? '#FFFFFF' : '#000000';
            const inactiveColor = isDark ? '#666666' : '#999999';

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.dockItem}
                activeOpacity={0.7}
              >
                <Icon
                  size={24}
                  color={isFocused ? activeColor : inactiveColor}
                  strokeWidth={isFocused ? 2.5 : 1.5}
                />
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <SmartDock {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="translate" />
      <Tabs.Screen name="history" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  fadeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  dockContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    gap: 36, // Adjusted gap for 3 items
  },
  dockItem: {
    padding: 8,
  },
});
