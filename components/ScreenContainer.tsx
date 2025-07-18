import React from 'react';
import { SafeAreaView, StatusBar, ImageBackground, View } from 'react-native';
import { useColorScheme } from 'react-native';

interface ScreenContainerProps {
  children: React.ReactNode;
  backgroundImage?: string;
  hasOverlay?: boolean;
  overlayOpacity?: number;
}

export function ScreenContainer({ 
  children, 
  backgroundImage, 
  hasOverlay = false, 
  overlayOpacity = 0.5 
}: ScreenContainerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const content = (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#111827' : '#ffffff'}
      />
      {children}
    </SafeAreaView>
  );

  if (backgroundImage) {
    return (
      <ImageBackground
        source={{ uri: backgroundImage }}
        className="flex-1"
        resizeMode="cover"
      >
        {hasOverlay && (
          <View 
            className={`flex-1 ${isDark ? 'bg-black' : 'bg-black'}`}
            style={{ opacity: overlayOpacity }}
          />
        )}
        <View className="flex-1" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {content}
        </View>
      </ImageBackground>
    );
  }

  return content;
}