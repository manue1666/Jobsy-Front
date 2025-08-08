import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useColorScheme } from 'react-native';

interface ContentFilterProps {
  onFilterChange?: (filter: 'oficio' | 'empresa') => void;
}

export const ContentFilter: React.FC<ContentFilterProps> = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState<'oficio' | 'empresa'>('oficio');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleFilterPress = (filter: 'oficio' | 'empresa') => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  const FilterButton = ({ 
    title, 
    filter, 
    isActive 
  }: { 
    title: string; 
    filter: 'oficio' | 'empresa'; 
    isActive: boolean; 
  }) => (
    <TouchableOpacity
      onPress={() => handleFilterPress(filter)}
      className={`flex-1 py-3 rounded-full mx-1 ${
        isActive
          ? 'bg-blue-500'
          : isDark
          ? 'bg-gray-800 border border-gray-700'
          : 'bg-gray-100 border border-gray-200'
      }`}
      activeOpacity={0.7}
    >
      <Text
        className={`text-center font-medium ${
          isActive
            ? 'text-white'
            : isDark
            ? 'text-gray-200'
            : 'text-gray-700'
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="px-4 mb-4">
      <View className="flex-row">
        <FilterButton
          title="Oficio"
          filter="oficio"
          isActive={activeFilter === 'oficio'}
        />
        <FilterButton
          title="Empresa"
          filter="empresa"
          isActive={activeFilter === 'empresa'}
        />
      </View>
    </View>
  );
};