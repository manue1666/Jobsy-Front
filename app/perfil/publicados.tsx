import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  ScrollView,
  View,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ServiceFeedCard } from "@/components/mainComponents/principal/ServiceFeedCard";
import { getUserServices, deleteService } from "@/helpers/service";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { OwnedServiceCard } from "@/components/mainComponents/principal/OwnedService";
import { ThemeContext } from "@/context/themeContext";
import { BannerPremium } from "@/components/mainComponents/principal/bannerPremium";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { getUserProfile } from "@/helpers/profile";
import { useAlert } from "@/components/mainComponents/Alerts";

interface myService {
  id: string;
  title: string;
  personName: string;
  profilePic: string;
}

export default function MainFeedScreen() {
  const [searchText, setSearchText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [services, setServices] = useState<myService[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userIsPremium, setUserIsPremium] = useState<boolean | null>(null);
  const router = useRouter();
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";
  const { okAlert, errAlert } = useAlert();

  // Función para transformar los datos del API
  const transformServiceData = (apiServices: any[]): myService[] => {
    return apiServices.map((service) => ({
      id: service._id,
      title: service.service_name,
      personName: service.user_id?.name || "Anónimo",
      profilePic: service.user_id?.profilePhoto,
    }));
  };

  const fetchServices = async (pageNum = 1, searchQuery = "", OwnerId = "") => {
    try {
      setLoading(true);
      const result = await getUserServices();

      setServices((prev) =>
        pageNum === 1
          ? transformServiceData(result.services)
          : [...prev, ...transformServiceData(result.services)]
      );
      setTotalPages(result.pages);
      setPage(pageNum);
    } catch (error: any) {
      errAlert("Error", error.message || "No se pudieron cargar los servicios");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchServices(1, searchText);
  };

  const handleServicePress = (serviceId: string) => {
    console.log("Edit service:", serviceId);
    router.push(`/servicio/${serviceId}/editar`);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      fetchServices(page + 1, searchText);
    }
  };

  const handleLongPress = (serviceId: string) => {
    Alert.alert(
      "Eliminar servicio",
      "¿Estás seguro de que deseas eliminar este servicio?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteService(serviceId);
              if (success) {
                setServices((prev) => prev.filter((s) => s.id !== serviceId));
                okAlert("Éxito", "Servicio eliminado correctamente");
              }
            } catch (error: any) {
              errAlert("Error", error.message || "No se pudo eliminar el servicio");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Obtener si el usuario es premium usando getUserProfile
  useEffect(() => {
    const fetchUserPremium = async () => {
      try {
        const userProfile = await getUserProfile();
        setUserIsPremium(!!userProfile?.user?.isPremium);
      } catch {
        setUserIsPremium(false);
      }
    };
    fetchUserPremium();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        fetchServices(1, "");
      };
      init();
    }, [])
  );

  return (
    <ScreenContainer>
      <Stack.Screen
        name="MyServices"
        options={{
          title: "Mis servicios",
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" }, // Cambia el fondo del header
          headerTintColor: isDark ? "#ffffff" : "#000000", // Cambia el color del texto y flecha
        }}
      />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        <View className="pb-6">
          <BannerPremium />
          {/* Aviso para usuarios no premium */}
          {userIsPremium === false && (
            <View className="mx-4 my-4 p-4 rounded-xl bg-yellow-100 border border-yellow-300 flex-row items-center">
              <Ionicons
                name="lock-closed"
                size={24}
                color="#FFD700"
                style={{ marginRight: 10 }}
              />
              <Text className="text-yellow-800 font-semibold">
                Solo los usuarios <Text className="font-bold">Premium</Text>{" "}
                pueden editar sus servicios publicados.
              </Text>
            </View>
          )}
          {/* Lista de servicios */}
          {services.map((service) => (
            <OwnedServiceCard
              key={service.id}
              id={service.id}
              profilePic={service.profilePic}
              title={service.title}
              personName={service.personName}
              onPress={
                userIsPremium ? () => handleServicePress(service.id) : undefined
              }
              onLongPress={
                userIsPremium ? () => handleLongPress(service.id) : undefined
              }
              disabled={!userIsPremium}
            />
          ))}

          {loading && page > 1 && (
            <View className="py-4">
              <ActivityIndicator size="small" />
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// Función auxiliar para detectar scroll cerca del final
const isCloseToBottom = ({
  layoutMeasurement,
  contentOffset,
  contentSize,
}: any) => {
  const paddingToBottom = 20;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};
