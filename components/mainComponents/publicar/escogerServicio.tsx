import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

interface ServiceType {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface ServiceTypeSelectorProps {
  onSelectionChange?: (selectedTypes: string[]) => void;
  allowMultiple?: boolean;
}

export const ServiceTypeSelector: React.FC<ServiceTypeSelectorProps> = ({ 
  onSelectionChange,
  allowMultiple = true 
}) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const serviceTypes: ServiceType[] = [
    { id: 'domicilio', label: 'A domicilio', icon: 'home-outline' },
    { id: 'comercio', label: 'En comercio', icon: 'storefront-outline' },
  ];

  const toggleSelection = (typeId: string) => {
    let newSelection: string[];
    
    if (allowMultiple) {
      newSelection = selectedTypes.includes(typeId)
        ? selectedTypes.filter(id => id !== typeId)
        : [...selectedTypes, typeId];
    } else {
      newSelection = selectedTypes.includes(typeId) ? [] : [typeId];
    }
    
    setSelectedTypes(newSelection);
    onSelectionChange?.(newSelection);
  };

  return (
    <View className="mb-6">
      <Text className={`text-base font-medium mb-4 ${
        isDark ? 'text-gray-200' : 'text-gray-800'
      }`}>
        Tipo de servicio
      </Text>
      
      <View className="flex-row flex-wrap gap-3">
        {serviceTypes.map((type) => {
          const isSelected = selectedTypes.includes(type.id);
          
          return (
            <TouchableOpacity
              key={type.id}
              onPress={() => toggleSelection(type.id)}
              className={`flex-row items-center px-4 py-3 rounded-xl ${
                isSelected
                  ? 'bg-blue-500'
                  : isDark
                  ? 'bg-gray-700 border border-gray-600'
                  : 'bg-gray-100 border border-gray-200'
              }`}
            >
              <Ionicons
                name={isSelected ? 'checkmark-circle' : type.icon}
                size={20}
                color={
                  isSelected
                    ? 'white'
                    : isDark
                    ? '#9CA3AF'
                    : '#6B7280'
                }
                style={{ marginRight: 8 }}
              />
              <Text
                className={`font-medium ${
                  isSelected
                    ? 'text-white'
                    : isDark
                    ? 'text-gray-200'
                    : 'text-gray-700'
                }`}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};