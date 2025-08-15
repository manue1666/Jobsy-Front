import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "@/context/themeContext";

interface ServiceFeedCardProps {
  id: string;
  title: string;
  address: string; // Cambiado de distance a address
  category: string; // Nueva prop
  personName: string;
  serviceImages: string[];
  description: string;
  isFavorite: boolean;
  isAd?: boolean;
  adUrl?: string;
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
  isAd = false,
  adUrl,
  onToggleFavorite,
  onPress,
  
}) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const handleToggleFavorite = () => {
    const newFavoriteState = !favorite;
    setFavorite(newFavoriteState);
    onToggleFavorite?.(id, newFavoriteState);
  };

  const handleAdPress = async () => {
    if (isAd && adUrl) {
      try {
        const supported = await Linking.canOpenURL(adUrl);
        if (supported) {
          await Linking.openURL(adUrl);
        } else {
          Alert.alert("Error", "No se puede abrir el enlace");
        }
      } catch (error) {
        Alert.alert("Error", "No se puede abrir el enlace");
      }
    } else {
      onPress?.();
    }
  };

/*   const handleContactPress = () => {
    if (isAd && adUrl) {
      handleAdPress();
    } else {
      onContactPress?.();
    }
  }; */

  return (
    <TouchableOpacity
      onPress={handleAdPress}
      className={`mx-4 mb-4 rounded-2xl overflow-hidden shadow-sm ${
        isDark ? "bg-gray-800" : "bg-white"
      } ${isAd ? "border-2 border-blue-200" : ""}`}
      activeOpacity={0.95}
    >
      {/* Ad Badge */}
      {isAd && (
        <View className="absolute top-3 left-3 bg-blue-500 rounded-full px-2 py-1 z-10">
          <Text className="text-white text-xs font-bold">ANUNCIO</Text>
        </View>
      )}

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
                source={{ uri: imageUri }}
                className="w-full h-48"
                style={{ width: 350 }} // Approximate card width
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

          {/* Only show favorite for non-ads */}
          {!isAd && (
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
          )}
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
          >
            {description}
          </Text>
        )}

        {/* Action Button (opcional) */}
        {/* <TouchableOpacity
          onPress={handleContactPress}
          className={`rounded-xl py-3 items-center ${
            isAd ? 'bg-green-500' : 'bg-blue-500'
          }`}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-base">
            {isAd ? 'Visitar sitio' : 'Contactar'}
          </Text>
        </TouchableOpacity> */}
      </View>
    </TouchableOpacity>
  );
};
