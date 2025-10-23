import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { initStripe } from '@stripe/stripe-react-native';

export function StripeInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error('❌ Stripe publishable key is missing');
      return;
    }

    const initializeStripe = async () => {
      try {
        await initStripe({
          publishableKey,
          merchantIdentifier: 'merchant.com.marudehabanero.Jobsy',
          threeDSecureParams: {
            timeout: 5,
          },
        });
        setIsInitialized(true);
        console.log(`✅ Stripe initialized successfully for ${Platform.OS}`);
      } catch (error) {
        console.error('❌ Stripe initialization failed:', error);
      }
    };

    initializeStripe();
  }, []);

  return null;
}