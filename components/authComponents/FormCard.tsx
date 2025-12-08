import React, { useContext } from 'react';
import { View, Text, ScrollView, ViewStyle } from 'react-native';
import { ThemeContext } from '@/context/themeContext';

interface FormCardProps {
  title?: string; 
  children: React.ReactNode;
  scrollable?: boolean;
  dark?: boolean;
  contentContainerStyle?: ViewStyle;
}

export function FormCard({ 
  title, 
  children, 
  scrollable = true,
  contentContainerStyle // ← AGREGAR
}: FormCardProps) {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const cardContent = (
    <View className={`${isDark ? 'bg-gray-800/95' : 'bg-white/95'} rounded-3xl p-8 shadow-lg`}>
      {title && ( // ← HACER CONDICIONAL
        <Text className={`${isDark ? 'text-gray-200' : 'text-gray-800'} text-center text-xl font-bold mb-6`}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle} 
      >
        {cardContent}
      </ScrollView>
    );
  }

  return cardContent;
}