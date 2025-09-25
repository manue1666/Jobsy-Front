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
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
  const { id, personName: personNameParam, profilePhoto: profilePhotoParam } = useLocalSearchParams<{ id: string; personName?: string; profilePhoto?: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext); // user._id para comparar
  const isDark = currentTheme === "dark";
  const { okAlert, errAlert } = useAlert();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

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

  // Helper para obtener el id del publicador
  const publisherId = (service?.user && (service.user as any)._id) ||
    (typeof service?.user_id === 'object' && (service.user_id as any)._id) ||
    (typeof service?.user_id === 'string' ? service.user_id : undefined);

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

      {/* Card: Datos del usuario debajo del header (clickable) */}
      <TouchableOpacity
        disabled={!publisherId}
        onPress={() => {
          if (publisherId) {
            router.push({ pathname: "/perfil/userProfile", params: { userId: publisherId } });
          }
        }}
        className={`mx-4 mb-4 p-5 rounded-2xl shadow-lg ${cardBgColor} flex-row items-center`}
        activeOpacity={0.8}
      >
        <Image
          source={{
            uri:
              service.user?.profilePhoto ||
              (typeof service.user_id === 'object' && service.user_id.profilePhoto) ||
              profilePhotoParam ||
              'https://imgs.search.brave.com/F3S732RuH1idxV7dDfEqAM9vKEJhhxQ-XP8pb4iaOmM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzllLzgz/Lzc1LzllODM3NTI4/ZjAxY2YzZjQyMTE5/YzVhZWVlZDFiMzM2/LmpwZw'
          }}
          className="w-16 h-16 rounded-full mr-4 border-2 border-blue-400"
          resizeMode="cover"
        />
        <View>
          <Text className={`text-lg font-semibold ${textColor}`}>
            {service.user?.name || (typeof service.user_id === 'object' && service.user_id.name) || personNameParam || 'Usuario'}
          </Text>
          <Text className={`text-sm ${secondaryTextColor}`}>{publisherId ? 'Ver perfil' : 'Publicador'}</Text>
        </View>
      </TouchableOpacity>

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

      {/* Card: Fecha de publicación */}
      <View className={`mx-4 mb-4 p-5 rounded-2xl shadow-lg ${cardBgColor}`}>
        <Text className={`font-semibold mb-2 ${textColor}`}>Fecha de publicación</Text>
        <Text className={`text-lg ${secondaryTextColor}`}>{new Date(service.createdAt).toLocaleDateString()}</Text>
      </View>

      {/* Card: Tipos de servicio */}
      {service.tipo && service.tipo.length > 0 && (
        <View className={`mx-4 mb-4 p-7 rounded-3xl shadow-lg ${cardBgColor}`}>
          <Text className={`text-xl font-bold mb-4 ${textColor}`}>Tipos de servicio</Text>
          <View className="flex-row flex-wrap justify-start">
            {service.tipo.map((tipo, index) => (
              <View
                key={index}
                className="bg-green-300 px-4 py-2 rounded-full mr-3 mb-3"
              >
                <Text className="text-base text-green-900 font-semibold">{tipo}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

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
