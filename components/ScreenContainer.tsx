import { ThemeContext } from '@/context/themeContext';
import React, { useContext } from 'react';
import { StatusBar, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ← CAMBIAR IMPORT

interface ScreenContainerProps {
  children: React.ReactNode;
  hasOverlay?: boolean;
  overlayOpacity?: number;
  contentClassName?: string;
  androidSafeArea?: boolean;
  dark?: boolean;
}

export function ScreenContainer({ 
  children,
  contentClassName = '',
  androidSafeArea = true,
}: ScreenContainerProps) {
  const {currentTheme} = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const containerClasses = [
    'flex-1',
    isDark ? 'bg-gray-900' : 'bg-white',
    contentClassName
  ].filter(Boolean).join(' ');

  
  return (
    <SafeAreaView 
      className={containerClasses}
      edges={androidSafeArea ? ['top', 'left', 'right'] : []} // ← USAR edges en lugar de paddingTop
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#111827' : '#ffffff'}
      />
      {children}
    </SafeAreaView>
  );
}
