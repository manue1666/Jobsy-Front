import React from 'react';
import { SafeAreaView, StatusBar, ImageBackground, View, Platform } from 'react-native';
import { useColorScheme } from 'react-native';

interface ScreenContainerProps {
  children: React.ReactNode;
  hasOverlay?: boolean;
  overlayOpacity?: number;
  contentClassName?: string;
  androidSafeArea?: boolean;
}

export function ScreenContainer({ 
  children,
  contentClassName = '',
  androidSafeArea = true
}: ScreenContainerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const containerClasses = [
    'flex-1',
    isDark ? 'bg-gray-900' : 'bg-white',
    contentClassName
  ].filter(Boolean).join(' ');

  const androidPadding = Platform.OS === 'android' ? { paddingTop: StatusBar.currentHeight } : {};

  return (
	<SafeAreaView className={containerClasses} style={androidSafeArea ? androidPadding : {}}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#111827' : '#ffffff'}
      />
      {children}
    </SafeAreaView>
  );
}
