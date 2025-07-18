import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import ThemeModal from '../components/ThemeModal';
import LoadingScreen from '../components/LoadingScreen';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
          <Stack.Screen name="loading" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat/[userId]" />
          <Stack.Screen name="circle/[circleId]" />
          <Stack.Screen name="people" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
        <ThemeModal />
      </ThemeProvider>
    </AuthProvider>
  );
}
