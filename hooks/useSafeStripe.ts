import { useState, useEffect } from 'react';

export interface SafeStripe {
  initPaymentSheet: (options: any) => Promise<any>;
  presentPaymentSheet: () => Promise<any>;
  isAvailable: boolean;
  isLoading: boolean;
}

export function useSafeStripe(): SafeStripe {
  const [stripe, setStripe] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // ✅ Importación dinámica - solo se carga si se usa
        const stripeModule = await import('@stripe/stripe-react-native');
        setStripe(stripeModule);
        setIsAvailable(true);
      } catch (error) {
        console.warn('Stripe native module not available:', error);
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeStripe();
  }, []);

  // ✅ Funciones seguras con fallbacks
  const initPaymentSheet = async (options: any) => {
    if (!stripe) {
      throw new Error('Stripe not available');
    }
    return stripe.initPaymentSheet(options);
  };

  const presentPaymentSheet = async () => {
    if (!stripe) {
      throw new Error('Stripe not available');
    }
    return stripe.presentPaymentSheet();
  };

  return {
    initPaymentSheet,
    presentPaymentSheet,
    isAvailable,
    isLoading
  };
}