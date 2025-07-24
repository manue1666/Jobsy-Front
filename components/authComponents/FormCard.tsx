import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';

interface FormCardProps {
  title: string;
  children: React.ReactNode;
  scrollable?: boolean;
}

export function FormCard({ title, children, scrollable = true }: FormCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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