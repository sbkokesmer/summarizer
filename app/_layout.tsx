import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { PurchasesProvider } from '@/context/PurchasesContext';
import '../i18n';

function AuthGuard() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inProtectedArea =
      segments[0] === '(tabs)' ||
      segments[0] === 'settings' ||
      segments[0] === 'paywall' ||
      segments[0] === 'notifications' ||
      segments[0] === 'help-center' ||
      segments[0] === 'privacy-policy';

    if (!session && inProtectedArea) {
      router.replace('/login');
    } else if (session && segments[0] === 'login') {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments]);

  return null;
}

function AppNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            title: 'Settings',
            headerTitleStyle: { fontWeight: '600' },
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            presentation: 'modal',
            title: 'Notifications',
            headerTitleStyle: { fontWeight: '600' },
          }}
        />
        <Stack.Screen
          name="help-center"
          options={{
            presentation: 'modal',
            title: 'Help Center',
            headerTitleStyle: { fontWeight: '600' },
          }}
        />
        <Stack.Screen
          name="privacy-policy"
          options={{
            presentation: 'modal',
            title: 'Privacy Policy',
            headerTitleStyle: { fontWeight: '600' },
          }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <AuthGuard />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <AuthProvider>
        <PurchasesProvider>
          <AppNavigator />
        </PurchasesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
