import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Colors } from '@/constants/Colors';
import '../i18n'; // Initialize i18n

export default function RootLayout() {
  useFrameworkReady();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <>
      <Stack screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background }
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="settings" 
          options={{ 
            presentation: 'modal', 
            title: 'Settings',
            headerTitleStyle: { fontWeight: '600' }
          }} 
        />
        <Stack.Screen 
          name="paywall" 
          options={{ 
            presentation: 'fullScreenModal',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            presentation: 'fullScreenModal',
            headerShown: false,
            animation: 'fade'
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}
