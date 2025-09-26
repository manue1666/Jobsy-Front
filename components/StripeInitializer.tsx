import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { initStripe } from '@stripe/stripe-react-native';

export function StripeInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        console.error('Stripe publishable key is missing');
        return;
      }
      initStripe({
        publishableKey,
        merchantIdentifier: 'merchant.com.marudehabanero.Jobsy',
      });
      setIsInitialized(true);
      console.log('Stripe initialized successfully for Android');
    } else {
      setIsInitialized(true);
    }
  }, []);

  return null; // Este componente no renderiza nada visualmente
}