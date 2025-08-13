import React, { useContext, useState } from 'react';
import { TouchableOpacity, View, Text, Image, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '@/context/themeContext';

interface FavoriteCardProps {
  id: string;
  title: string;
  distance: string;
  personName: string;
  profilePic: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onPress?: () => void;
}

export const FavoriteCard: React.FC<FavoriteCardProps> = ({
  id,
  title,
  distance,
  personName,
  profilePic,
  isFavorite = true,
  onToggleFavorite,
  onPress
}) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const {currentTheme} = useContext(ThemeContext);
  const isDark = currentTheme === 'dark';

  const handleToggleFavorite = () => {
    const newFavoriteState = !favorite;
    setFavorite(newFavoriteState);
    onToggleFavorite?.(id, newFavoriteState);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-2xl mx-4 mb-3 p-4 shadow-sm ${
        isDark 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-100'
      }`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={handleToggleFavorite}
            className="mr-4"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={favorite ? "heart" : "heart-outline"}
              size={24}
              color={favorite ? "#EF4444" : (isDark ? "#9CA3AF" : "#9CA3AF")}
            />
          </TouchableOpacity>
          
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className={`text-lg font-semibold mr-2 ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {title}
              </Text>
              <Text className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {distance}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center">
          <Text className={`font-medium mr-3 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>
            {personName}
          </Text>
          <Image
            source={{ uri: profilePic }}
            className="w-10 h-10 rounded-full"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};