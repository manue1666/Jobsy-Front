// components/mainComponents/principal/header.tsx
import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '@/context/themeContext';

interface UserData {
  name?: string;
  profilePhoto?: string;
}

interface FeedHeaderProps {
  userData?: UserData;
  onProfilePress?: () => void;
  onFilterPress?: () => void; // Nuevo: abrir panel de filtros
  activeFiltersCount?: number; // Nuevo: mostrar badge
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  userData,
  onProfilePress = () => {},
  onFilterPress = () => {},
  activeFiltersCount = 0,
}) => {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === 'dark';

  const safeUserData = {
    name: 'Usuario',
    profilePhoto: 'https://via.placeholder.com/150',
    ...userData
  };

  return (
    <View className={`flex-row items-center justify-between px-4 py-4 ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Left side - Greeting and Profile */}
      <TouchableOpacity 
        onPress={onProfilePress}
        className="flex-row items-center flex-1"
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: safeUserData.profilePhoto }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <Text className={`text-xl font-bold ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}>
          Hola, {safeUserData.name}!
        </Text>
      </TouchableOpacity>

      {/* Right side - Filter Button */}
      <TouchableOpacity
        onPress={onFilterPress}
        className={`p-2 rounded-full relative ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}
        activeOpacity={0.7}
      >
        <Ionicons
          name="filter-outline"
          size={24}
          color={isDark ? '#E5E7EB' : '#374151'}
        />
        {/* Badge de filtros activos */}
        {activeFiltersCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {activeFiltersCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};