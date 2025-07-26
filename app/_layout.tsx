import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const loaded = true;

  return (
    <>
      <StatusBar style="light" backgroundColor="#87CEEB" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="car-selection" />
        <Stack.Screen name="photo-upload" />
        <Stack.Screen name="race" />
        <Stack.Screen name="results" />
      </Stack>
    </>
  );
}