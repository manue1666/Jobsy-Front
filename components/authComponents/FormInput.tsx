import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useColorScheme } from 'react-native';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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