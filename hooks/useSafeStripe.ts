import { useState, useEffect } from 'react';
import { initPaymentSheet as stripeInitPaymentSheet, presentPaymentSheet as stripePresentPaymentSheet } from '@stripe/stripe-react-native';

export interface SafeStripe {
  initPaymentSheet: (options: any) => Promise<any>;
  presentPaymentSheet: () => Promise<any>;
  isAvailable: boolean;
  isLoading: boolean;
}

export function useSafeStripe(): SafeStripe {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAvailable(true);
    setIsLoading(false);
  }, []);

  // ✅ Funciones seguras con fallbacks
  const initPaymentSheet = async (options: any) => {
    if (!isAvailable) {
      throw new Error('Stripe not available');
    }
    return stripeInitPaymentSheet(options);
  };

  const presentPaymentSheet = async () => {
    if (!isAvailable) {
      throw new Error('Stripe not available');
    }
    return stripePresentPaymentSheet();
  };

  return {
    initPaymentSheet,
    presentPaymentSheet,
    isAvailable,
    isLoading
  };
}