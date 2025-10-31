import React, { useContext, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "@/context/themeContext";
import { getImageSource } from "@/helpers/imageUtils";

interface ServiceFeedCardProps {
  id: string;
  title: string;
  address: string;
  category: string;
  personName: string;
  serviceImages: string[];
  description: string;
  isFavorite: boolean;
  favoritesCount?: number; // Nuevo: contador de favoritos
  isPromoted?: boolean; // Nuevo parámetro opcional
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onPress?: () => void;
  onContactPress?: () => void;
}

export const ServiceFeedCard: React.FC<ServiceFeedCardProps> = ({
  id,
  title,
  address,
  category,
  personName,
  serviceImages = [],
  description,
  isFavorite = false,
  favoritesCount = 0,
  isPromoted = false,
  onToggleFavorite,
  onPress,
}) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  // Truncar descripción a 100 caracteres
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const handleToggleFavorite = () => {
    const newFavoriteState = !favorite;
    setFavorite(newFavoriteState);
    onToggleFavorite?.(id, newFavoriteState);
  };

  const handleCardPress = () => {
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handleCardPress}
      className={`mx-4 mb-4 rounded-2xl overflow-hidden shadow-sm ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}
      activeOpacity={0.95}
    >
      {/* Service Images */}
      {serviceImages.length > 0 && (
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className="h-48"
          >
            {serviceImages.map((imageUri, index) => (
              <Image
                key={index}
                source={getImageSource(imageUri)}
                className="w-full h-48"
                style={{ width: 350 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Image counter */}
          {serviceImages.length > 1 && (
            <View className="absolute bottom-3 right-3 bg-black/50 rounded-full px-2 py-1">
              <Text className="text-white text-xs font-medium">
                1/{serviceImages.length}
              </Text>
            </View>
          )}

          {/* Promoted Icon */}
          {isPromoted && (
            <View
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                backgroundColor: "#2563eb",
                borderRadius: 9999,
                padding: 6,
                zIndex: 10,
                elevation: 3,
              }}
            >
              <Ionicons name="rocket-outline" size={20} color="#fff" />
            </View>
          )}
        </View>
      )}

      {/* Card Content */}
      <View className="p-4">
        {/* Header - Title and Favorite */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text
              className={`font-semibold text-base ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {title}
            </Text>
            <View className="flex-row items-center">
              <Text
                className={`text-sm mr-2 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {personName}
              </Text>
              <Text
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                • {category}
              </Text>
            </View>
          </View>

          {/* Favorite Button y contador */}
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleToggleFavorite}
              className="p-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={favorite ? "heart" : "heart-outline"}
                size={24}
                color={favorite ? "#EF4444" : isDark ? "#9CA3AF" : "#9CA3AF"}
              />
            </TouchableOpacity>
            <Text
              className={`ml-1 text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {favoritesCount}
            </Text>
          </View>
        </View>

        {/* Address */}
        <View className="flex-row items-start mb-3">
          <Ionicons
            name="location-outline"
            size={16}
            color={isDark ? "#9CA3AF" : "#6B7280"}
            style={{ marginTop: 2 }}
          />
          <Text
            className={`text-sm ml-1 flex-1 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {address || "Dirección no disponible"}
          </Text>
        </View>

        {/* Description */}
        {description && (
          <Text
            className={`text-sm mb-3 leading-5 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
            numberOfLines={2}
          >
            {truncateDescription(description, 100)}
          </Text>
        )}

        {/* Action Button (opcional) */}
        {/* <TouchableOpacity
          onPress={onContactPress}
          className="rounded-xl py-3 items-center bg-blue-500"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-base">
            Contactar
          </Text>
        </TouchableOpacity> */}
      </View>
    </TouchableOpacity>
  );
};
