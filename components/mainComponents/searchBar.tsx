import React from 'react';
import { TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearchPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Buscar...",
  value,
  onChangeText,
  onSearchPress
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={`flex-row items-center rounded-full px-4 py-3 mx-4 mb-4 ${
      isDark ? 'bg-gray-800' : 'bg-gray-100'
    }`}>
      <TextInput
        className={`flex-1 text-base ${isDark ? 'text-gray-100' : 'text-gray-700'}`}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity
        onPress={onSearchPress}
        className="ml-2 p-1"
      >
        <Ionicons 
          name="search" 
          size={20} 
          color={isDark ? "#9CA3AF" : "#6B7280"} 
        />
      </TouchableOpacity>
    </View>
  );
};