import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Colors } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import '../i18n';

function AuthGuard() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inProtectedArea = segments[0] === '(tabs)' || segments[0] === 'settings' || segments[0] === 'paywall';

    if (!session && inProtectedArea) {
      router.replace('/login');
    } else if (session && segments[0] === 'login') {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  useFrameworkReady();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <AuthProvider>
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
      <AuthGuard />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </AuthProvider>
  );
}
