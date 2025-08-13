import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '@/context/themeContext';

interface FeedHeaderProps {
  userName?: string;
  userImage?: string;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  userName = "Gabriel",
  userImage = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  onProfilePress,
  onNotificationsPress
}) => {
  const {currentTheme} = useContext(ThemeContext);
  const isDark = currentTheme === 'dark';

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
          source={{ uri: userImage }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <Text className={`text-xl font-bold ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}>
          Hola, {userName}!
        </Text>
      </TouchableOpacity>

      {/* Right side - Notifications */}
      <TouchableOpacity
        onPress={onNotificationsPress}
        className={`p-2 rounded-full ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}
        activeOpacity={0.7}
      >
        <Ionicons
          name="notifications-outline"
          size={24}
          color={isDark ? '#E5E7EB' : '#374151'}
        />
      </TouchableOpacity>
    </View>
  );
};