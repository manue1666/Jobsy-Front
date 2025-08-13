import React, { useContext } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { ThemeContext } from '@/context/themeContext';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  isRequired?: boolean;
}

export function FormInput({ 
  label, 
  error, 
  isRequired = false, 
  ...textInputProps 
}: FormInputProps) {
    const {currentTheme} = useContext(ThemeContext);
    const isDark = currentTheme === "dark";

  return (
    <View className="mb-4">
      <Text className={`${isDark ? 'text-gray-400' : 'text-gray-700'} text-sm mb-2`}>
        {label}
        {isRequired && <Text className="text-red-500"> *</Text>}
      </Text>
      <TextInput
        className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl px-4 py-4 text-base ${isDark ? 'text-white' : 'text-black'} ${error ? 'border-2 border-red-500' : ''}`}
        placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
        {...textInputProps}
      />
      {error && (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      )}
    </View>
  );
}