import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function StripeInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeStripe = async () => {
      // Solo es necesario inicializar en Android
      if (Platform.OS === 'android') {
        try {
          const { initStripe } = await import('@stripe/stripe-react-native');
          const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
          
          if (!publishableKey) {
            console.error('Stripe publishable key is missing');
            return;
          }

          await initStripe({
            publishableKey,
            merchantIdentifier: 'merchant.com.marudehabanero.Jobsy',
          });
          
          setIsInitialized(true);
          console.log('Stripe initialized successfully for Android');
        } catch (error) {
          console.error('Failed to initialize Stripe:', error);
        }
      } else {
        // Para iOS no necesitamos esta inicialización
        setIsInitialized(true);
      }
    };

    initializeStripe();
  }, []);

  return null; // Este componente no renderiza nada visualmente
}