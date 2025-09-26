import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';

// ✅ Provider seguro que no rompe la app
function getValidChildren(children: React.ReactNode): React.ReactElement | React.ReactElement[] {
  if (Array.isArray(children)) {
    return children.filter(child => child && typeof child === 'object');
  }
  if (children && typeof children === 'object') {
    return children as React.ReactElement;
  }
  return <></>;
}

export default function SafeStripeProvider({ children }: { children: React.ReactNode }) {
  const [isStripeReady, setIsStripeReady] = useState(false);
  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  useEffect(() => {
    setIsStripeReady(true);
  }, [stripePublishableKey]);

  if (!isStripeReady) {
    return (
      <View style={{ flex: 1 }}>
        {getValidChildren(children)}
        <ActivityIndicator style={{ position: 'absolute' }} />
      </View>
    );
  }

  if (!stripePublishableKey) {
    return <>{getValidChildren(children)}</>;
  }

  return (
    <StripeProvider publishableKey={stripePublishableKey}>
      {getValidChildren(children)}
    </StripeProvider>
  );
}