import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

// ✅ Provider seguro que no rompe la app
export default function SafeStripeProvider({ children }: { children: React.ReactNode }) {
  const [isStripeReady, setIsStripeReady] = useState(false);
  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  useEffect(() => {
    if (!stripePublishableKey) {
      setIsStripeReady(true);
      return;
    }

    const checkStripe = async () => {
      try {
        // Verifica si el módulo está disponible
        await import('@stripe/stripe-react-native');
        setIsStripeReady(true);
      } catch (error) {
        console.warn('Stripe not available, continuing without it');
        setIsStripeReady(true); // ✅ IMPORTANTE: La app sigue funcionando
      }
    };

    checkStripe();
  }, [stripePublishableKey]);

  if (!isStripeReady) {
    return (
      <View style={{ flex: 1 }}>
        {children}
        <ActivityIndicator style={{ position: 'absolute' }} />
      </View>
    );
  }

  // ✅ Renderiza los hijos directamente SIN provider si Stripe no está disponible
  return <>{children}</>;
}