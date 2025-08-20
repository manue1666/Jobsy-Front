import React, { useEffect, useState, useCallback, useContext } from "react";
import { View, Text, ActivityIndicator, ScrollView, Image, Linking, TouchableOpacity, Alert } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { getServiceById, Service } from "@/helpers/service_detail";
import { FontAwesome, MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "@/context/themeContext";

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  // Colores dinámicos basados en el tema
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const secondaryTextColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const cardBgColor = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const buttonSecondaryBg = isDark ? 'bg-gray-700' : 'bg-gray-200';
  const buttonSecondaryText = isDark ? 'text-gray-200' : 'text-gray-700';
  const tagBgColor = isDark ? 'bg-blue-900' : 'bg-blue-100';
  const tagTextColor = isDark ? 'text-blue-200' : 'text-blue-800';

  useEffect(() => {
    const fetchService = async () => {
      try {
        if (typeof id !== "string") throw new Error("ID inválido");
        const data = await getServiceById(id);
        setService(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleWhatsAppPress = useCallback(() => {
    if (!service?.phone) return;

    const phoneNumber = service.phone.replace(/[^\d]/g, "");
    const url = `https://wa.me/${phoneNumber}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error','No se pudo abrir WhatsApp',[
          {
            text : 'OK'
          }
          ], {
          cancelable : true
          });
      }
    });
  }, [service?.phone]);

  const handleCallPress = useCallback(() => {
    if (!service?.phone) return;

    const phoneNumber = `tel:${service.phone.replace(/[^\d]/g, "")}`;
    Linking.openURL(phoneNumber);
  }, [service?.phone]);

  const handleEmailPress = useCallback(() => {
    if (!service?.email) return;

    const url = `mailto:${service.email}`;
    Linking.openURL(url);
  }, [service?.email]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className={`flex-1 justify-center items-center p-4 ${bgColor}`}>
        <Text className="text-red-500 text-lg">{error}</Text>
      </View>
    );
  }

  if (!service) {
    return (
      <View className={`flex-1 justify-center items-center ${bgColor}`}>
        <Text className={`text-lg ${secondaryTextColor}`}>Servicio no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView className={bgColor}>
      {/* Header con imagen */}
      <View className="relative h-64">
        {service.photos.length > 0 ? (
          <Image
            source={{ uri: service.photos[0] }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Ionicons name="image-outline" size={48} color="#9CA3AF" />
          </View>
        )}

        {/* Overlay para el título */}
        <View className="absolute bottom-0 left-0 right-0 h-32 bg-black/50" />

        <View className="absolute bottom-4 left-4">
          <Text className="text-white text-3xl font-bold">
            {service.service_name}
          </Text>
          <View className="flex-row items-center mt-1">
            <MaterialIcons name="category" size={16} color="white" />
            <Text className="text-white ml-1">{service.category}</Text>
          </View>
        </View>
      </View>

      {/* Contenido principal */}
      <View className="p-6">
        {/* Descripción */}
        <View className="mb-6">
          <Text className={`text-lg font-semibold mb-2 ${textColor}`}>Descripción</Text>
          <Text className={secondaryTextColor}>{service.description}</Text>
        </View>

        {/* Información de contacto */}
        <View className="mb-6">
          <Text className={`text-lg font-semibold mb-3 ${textColor}`}>
            Información de contacto
          </Text>

          <View className="space-y-3">
            {service.phone && (
              <View className="flex-row items-center">
                <Feather name="phone" size={20} color="#3B82F6" />
                <Text className={`ml-3 ${textColor}`}>{service.phone}</Text>
              </View>
            )}

            {service.email && (
              <View className="flex-row items-center">
                <Feather name="mail" size={20} color="#3B82F6" />
                <Text className={`ml-3 ${textColor}`}>{service.email}</Text>
              </View>
            )}

            {service.address && (
              <View className="flex-row items-start">
                <Feather name="map-pin" size={20} color="#3B82F6" />
                <Text className={`ml-3 flex-1 ${textColor}`}>
                  {service.address}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Botones de acción */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            onPress={handleWhatsAppPress}
            className="bg-green-500 py-3 px-6 rounded-full flex-row items-center justify-center flex-1 mr-2"
            disabled={!service.phone}
          >
            <FontAwesome name="whatsapp" size={20} color="white" />
            <Text className="text-white ml-2">WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCallPress}
            className="bg-blue-500 py-3 px-6 rounded-full flex-row items-center justify-center flex-1 ml-2"
            disabled={!service.phone}
          >
            <Feather name="phone" size={20} color="white" />
            <Text className="text-white ml-2">Llamar</Text>
          </TouchableOpacity>
        </View>

        {service.email && (
          <TouchableOpacity
            onPress={handleEmailPress}
            className={`${buttonSecondaryBg} py-3 px-6 rounded-full flex-row items-center justify-center mb-6`}
          >
            <Feather name="mail" size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
            <Text className={`ml-2 ${buttonSecondaryText}`}>Enviar correo</Text>
          </TouchableOpacity>
        )}

        {/* Detalles adicionales */}
        <View className={`${cardBgColor} p-4 rounded-lg`}>
          <Text className={`font-semibold mb-2 ${textColor}`}>Detalles del servicio</Text>

          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className={secondaryTextColor}>Publicado el:</Text>
              <Text className={textColor}>
                {new Date(service.createdAt).toLocaleDateString()}
              </Text>
            </View>

            {service.tipo && service.tipo.length > 0 && (
              <View className="flex-row justify-between">
                <Text className={secondaryTextColor}>Tipo:</Text>
                <View className="flex-row flex-wrap justify-end flex-1">
                  {service.tipo.map((tipo, index) => (
                    <View
                      key={index}
                      className={`${tagBgColor} px-2 py-1 rounded-full ml-1 mb-1`}
                    >
                      <Text className={`text-xs ${tagTextColor}`}>{tipo}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Galería de imágenes */}
        {service.photos.length > 1 && (
          <View className="mt-6">
            <Text className={`text-lg font-semibold mb-3 ${textColor}`}>Galería</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {service.photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  className="mr-3"
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: photo }}
                    className="w-32 h-32 rounded-lg"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
}