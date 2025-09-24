import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { getServiceById, Service } from "@/helpers/service_detail";
import {
  FontAwesome,
  MaterialIcons,
  Feather,
  Ionicons,
} from "@expo/vector-icons";
import { ThemeContext } from "@/context/themeContext";
import { AuthContext } from "@/context/authContext";
import CommentsSection from "./CommentsSection";
import { useAlert } from "@/components/mainComponents/Alerts";

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext); // user._id para comparar
  const isDark = currentTheme === "dark";
  const { okAlert, errAlert } = useAlert();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Colores dinámicos basados en el tema
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-gray-100" : "text-gray-800";
  const secondaryTextColor = isDark ? "text-gray-300" : "text-gray-600";
  const cardBgColor = isDark ? "bg-gray-800" : "bg-gray-50";
  const buttonSecondaryBg = isDark ? "bg-gray-700" : "bg-gray-200";
  const buttonSecondaryText = isDark ? "text-gray-200" : "text-gray-700";
  const tagBgColor = isDark ? "bg-blue-900" : "bg-blue-100";
  const tagTextColor = isDark ? "text-blue-200" : "text-blue-800";

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

  const handleWhatsAppPress = () => {
    if (!service?.phone) return;

    const url = `https://wa.me/${service.phone}`;

    Linking.openURL(url).catch(() => {
      errAlert("Error", "No se pudo abrir el enlace de WhatsApp");
    });
  };

  const handleCallPress = () => {
    if (!service?.phone) return;

    const phoneNumber = `tel:${service.phone.replace(/[^\d]/g, "")}`;
    Linking.openURL(phoneNumber);
  };

  const handleEmailPress = () => {
    if (!service?.email) return;

    const url = `mailto:${service.email}`;
    Linking.openURL(url);
  };

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
        <Text className={`text-lg ${secondaryTextColor}`}>
          Servicio no encontrado
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className={bgColor}>
      {/* Header con imagen y título */}
      <View className="relative h-64 mb-4">
        {service.photos.length > 0 ? (
          <Image
            source={{ uri: service.photos[0] }}
            className="w-full h-full rounded-b-3xl"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-b-3xl">
            <Ionicons name="image-outline" size={48} color="#9CA3AF" />
          </View>
        )}
        {/* Overlay para el título con fondo oscuro y transparencia */}
        <View className="absolute bottom-6 left-6 right-6">
          <View className="bg-black/60 rounded-xl px-4 py-3">
            <Text className="text-white text-3xl font-bold drop-shadow-lg">
              {service.service_name}
            </Text>
            <View className="flex-row items-center mt-1">
              <MaterialIcons name="category" size={16} color="white" />
              <Text className="text-white ml-1 text-base drop-shadow-lg">
                {service.category}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Card: Descripción */}
      <View className={`mx-4 mb-4 p-5 rounded-2xl shadow-lg ${cardBgColor}`}>
        <Text className={`text-lg font-semibold mb-2 ${textColor}`}>
          Descripción
        </Text>
        <Text className={secondaryTextColor}>{service.description}</Text>
      </View>

      {/* Card: Información de contacto */}
      <View className={`mx-4 mb-4 p-5 rounded-2xl shadow-lg ${cardBgColor}`}>
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
        {/* Botones de acción */}
        <View className="flex-row justify-between mt-6">
          <TouchableOpacity
            onPress={handleWhatsAppPress}
            className="bg-green-500 py-3 px-6 rounded-full flex-row items-center justify-center flex-1 mr-2 shadow"
            disabled={!service.phone}
          >
            <FontAwesome name="whatsapp" size={20} color="white" />
            <Text className="text-white ml-2">WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCallPress}
            className="bg-blue-500 py-3 px-6 rounded-full flex-row items-center justify-center flex-1 ml-2 shadow"
            disabled={!service.phone}
          >
            <Feather name="phone" size={20} color="white" />
            <Text className="text-white ml-2">Llamar</Text>
          </TouchableOpacity>
        </View>
        {service.email && (
          <TouchableOpacity
            onPress={handleEmailPress}
            className={`${buttonSecondaryBg} py-3 px-6 rounded-full flex-row items-center justify-center mt-4 shadow`}
          >
            <Feather
              name="mail"
              size={20}
              color={isDark ? "#E5E7EB" : "#4B5563"}
            />
            <Text className={`ml-2 ${buttonSecondaryText}`}>Enviar correo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Card: Detalles adicionales */}
      <View className={`mx-4 mb-4 p-5 rounded-2xl shadow-lg ${cardBgColor}`}>
        <Text className={`font-semibold mb-2 ${textColor}`}>
          Detalles del servicio
        </Text>

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

      {/* Card: Galería de imágenes */}
      {service.photos.length > 1 && (
        <View className={`mx-4 mb-4 p-5 rounded-2xl shadow-lg ${cardBgColor}`}>
          <Text className={`text-lg font-semibold mb-3 ${textColor}`}>
            Galería
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {service.photos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                className="mr-3"
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedImage(photo);
                  setModalVisible(true);
                }}
              >
                <Image
                  source={{ uri: photo }}
                  className="w-32 h-32 rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Modal para imagen en pantalla completa */}
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View className="flex-1 bg-black/90 justify-center items-center">
              <Pressable
                className="absolute top-10 right-10 z-10"
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={36} color="#fff" />
              </Pressable>
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  className="w-80 h-80 rounded-2xl"
                  resizeMode="contain"
                />
              )}
            </View>
          </Modal>
        </View>
      )}

      {/* Card: Sección de comentarios */}
      <View className={`mx-4 mb-8 p-5 rounded-2xl shadow-lg ${cardBgColor}`}>
        <CommentsSection serviceId={id as string} />
      </View>
    </ScrollView>
  );
}
