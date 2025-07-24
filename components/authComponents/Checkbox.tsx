import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useColorScheme } from 'react-native';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onPress, label, disabled = false }: CheckboxProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity 
      onPress={onPress} 
      className={`flex-row items-center ${disabled ? 'opacity-50' : ''}`}
      disabled={disabled}
    >
      <View
        className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
          checked 
            ? 'bg-blue-500 border-blue-500' 
            : (isDark ? 'border-gray-600' : 'border-gray-300')
        }`}
      >
        {checked && <Text className="text-white text-xs">✓</Text>}
      </View>
      <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm flex-1`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}