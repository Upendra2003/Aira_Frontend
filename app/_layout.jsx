import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import SafeScreen from '../components/SafeScreen'
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/utils/authStore';


export default function RootLayout() {
  const {isLoggedin,shouldCreateAccount, isAssessed} = useAuthStore()
  
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeScreen>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Protected guard={isLoggedin && isAssessed }>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isAssessed && isLoggedin}>
          <Stack.Screen name="assessment" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!isLoggedin && !shouldCreateAccount}>
        <Stack.Screen name="sign_in" options={{ headerShown: false }} />
        { /* </Stack.Protected>
        <Stack.Protected guard={ShouldCreateAccount}>*/ }
        <Stack.Screen name="sign_up" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </SafeScreen>
  );
}
