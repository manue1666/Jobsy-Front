import React, { useContext } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ThemeContext } from '@/context/themeContext';

interface FormCardProps {
  title: string;
  children: React.ReactNode;
  scrollable?: boolean;
  dark?: boolean
}

export function FormCard({ title, children, scrollable = true }: FormCardProps) {
    const {currentTheme} = useContext(ThemeContext);
    const isDark = currentTheme === "dark";

  const cardContent = (
    <View className={`${isDark ? 'bg-gray-800/95' : 'bg-white/95'} rounded-3xl p-8 shadow-lg`}>
      <Text className={`${isDark ? 'text-gray-200' : 'text-gray-800'} text-center text-xl font-bold mb-6`}>
        {title}
      </Text>
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {cardContent}
      </ScrollView>
    );
  }

  return cardContent;
}