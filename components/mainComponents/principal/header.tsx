// components/mainComponents/principal/header.tsx
import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '@/context/themeContext';

interface UserData {
  name?: string;
  profilePhoto?: string;
}

interface FeedHeaderProps {
  userData?: UserData;
  onProfilePress?: () => void;
  onNearbyPress?: () => void;
  loading?: boolean;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  userData,
  onProfilePress = () => {},
  onNearbyPress = () => {},
  loading = false
}) => {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === 'dark';

  // Valores por defecto seguros
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

      {/* Right side - Nearby Services */}
      <TouchableOpacity
        onPress={onNearbyPress}
        className={`p-2 rounded-full ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}
        activeOpacity={0.7}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={isDark ? '#E5E7EB' : '#374151'} />
        ) : (
          <Ionicons
            name="location-outline"
            size={24}
            color={isDark ? '#E5E7EB' : '#374151'}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};