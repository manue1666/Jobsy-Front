import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';
import "@/global.css"
import { SearchRangeProvider } from '@/context/searchRangeContext';
import ThemeProvider from '@/context/themeContext';
// ✅ Importa StripeProvider
import { StripeProvider } from '@stripe/stripe-react-native';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // Temporal hasta que hagamos el auth de verdad
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const colorScheme = useColorScheme();
  const skipAuth = process.env.EXPO_PUBLIC_SKIP_AUTH === 'true';

  // ✅ Configuración de Stripe
  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!stripePublishableKey) {
    console.error('❌ Stripe publishable key no encontrada');
    return null;
  }

  // ✅ Contenido de la app (igual que antes)
  const renderAppContent = () => {
    if (skipAuth) {
      return (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      );
    }

    return (
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    );
  };

  // ✅ Retorna la estructura ORIGINAL pero envuelta en StripeProvider
  return (
    <StripeProvider
      publishableKey={stripePublishableKey}
      urlScheme="jobsy"
      // ✅ No merchantIdentifier para Android
    >
      <ThemeProvider>
        <SearchRangeProvider>
          {renderAppContent()}
        </SearchRangeProvider>
      </ThemeProvider>
    </StripeProvider>
  );
}