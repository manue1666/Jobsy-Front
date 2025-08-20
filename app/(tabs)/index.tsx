import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SearchBar } from '@/components/mainComponents/favoritos/searchBar';
import { FeedHeader } from '@/components/mainComponents/principal/header';
import { ServiceFeedCard } from '@/components/mainComponents/principal/ServiceFeedCard';
import { getNearbyServices, searchService } from '@/helpers/search_service';
import { addFavorite, removeFavorite } from '@/helpers/favorites';
import { getUserProfile } from '@/helpers/profile';
import { useFocusEffect, useRouter } from 'expo-router';
import { getUserLocation } from '@/helpers/location';
import { useSearchRange } from "@/context/searchRangeContext";
import { Ionicons } from "@expo/vector-icons";
import { BannerBoost } from "@/components/mainComponents/principal/bannerBoost";

interface ServicePost {
  id: string;
  title: string;
  address: string; // Nuevo campo
  category: string; // Movido aquí para mejor acceso
  personName: string;
  serviceImages: string[];
  description: string;
  isFavorite: boolean;
  user?: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
  user_id?: any;
}

interface UserProfile {
  user?: {
    name: string;
    profilePhoto: string;
  };
}

export const BOOST_PLANS = {
  "24h": { amount: 150, durationMs: 24 * 60 * 60 * 1000 },
  "72h": { amount: 350, durationMs: 72 * 60 * 60 * 1000 },
  "1week": { amount: 600, durationMs: 7 * 24 * 60 * 60 * 1000 },
};

export default function MainFeedScreen() {
  const [searchText, setSearchText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [services, setServices] = useState<ServicePost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const router = useRouter();
  const { searchRange } = useSearchRange();

  // Función para transformar los datos del API
  const transformServiceData = useCallback(
    (apiServices: any[]): ServicePost[] => {
      return apiServices.map((service) => ({
        id: service._id,
        title: service.service_name,
        address: service.address || "Dirección no disponible",
        category: service.category,
        personName: service.user?.name || service.user_id?.name || "Anónimo",
        serviceImages:
          service.photos?.length > 0
            ? service.photos
            : [
                "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
              ],
        description: service.description,
        isFavorite: service.isFavorite || false,
      }));
    },
    []
  );


  // Método para cargar info del usuario activo
  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfileData(data);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message || "Error al obtener el perfil",
        [
          {
            text: "OK",
          },
        ],
        {
          cancelable: true,
        }
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchServices = useCallback(
    async (pageNum = 1, searchQuery = "") => {
      try {
        setLoading(true);
        const result = await searchService({
          query: searchQuery,
          page: pageNum,
          limit: 10,
        });

        setServices((prev) =>
          pageNum === 1
            ? transformServiceData(result.services)
            : [...prev, ...transformServiceData(result.services)]
        );
        setTotalPages(result.pages);
        setPage(pageNum);
      } catch (error: any) {
        Alert.alert(
          "Error",
          error.message || "Error al cargar servicios",
          [
            {
              text: "OK",
            },
          ],
          {
            cancelable: true,
          }
        );
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [transformServiceData]
  );

  const handleToggleFavorite = useCallback(
    async (serviceId: string, isCurrentlyFavorite: boolean) => {
      try {
        if (isCurrentlyFavorite) {
          await removeFavorite(serviceId);
        } else {
          await addFavorite(serviceId);
        }

        setServices((prevServices) =>
          prevServices.map((service) =>
            service.id === serviceId
              ? { ...service, isFavorite: !isCurrentlyFavorite }
              : service
          )
        );
      } catch (error: any) {
        console.error("Error al actualizar favorito:", error);
        Alert.alert(
          "Error",
          error.message || "No se pudo actualizar el favorito",
          [
            {
              text: "OK",
            },
          ],
          {
            cancelable: true,
          }
        );
      }
    },
    []
  );

  const handleNearbyPress = useCallback(async () => {
    try {
      setLocationLoading(true);
      const coords = await getUserLocation();
      if (!coords) return;

      const nearbyServices = await getNearbyServices(coords, searchRange);
      setServices(transformServiceData(nearbyServices));
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudieron cargar servicios cercanos",
        [
          {
            text: "OK",
          },
        ],
        {
          cancelable: true,
        }
      );
      console.error(error);
    } finally {
      setLocationLoading(false);
    }
  }, [transformServiceData, searchRange]);

  const handleLoadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      fetchServices(page + 1, searchText);
    }
  }, [page, totalPages, loading, searchText, fetchServices]);

  const getSafeUserData = useCallback(
    () => ({
      name: profileData?.user?.name || "Usuario",
      profilePhoto:
        profileData?.user?.profilePhoto || "https://via.placeholder.com/150",
    }),
    [profileData]
  );

  // Actualizar automaticamente
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
      fetchServices();
    }, [loadProfileData, fetchServices])
  );

  if (loading && page === 1) {
    return (
      <ScreenContainer>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              fetchServices(1, searchText);
            }}
          />
        }
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Header con la estructura correcta */}
        <FeedHeader
          userData={getSafeUserData()}
          onProfilePress={() => router.push("/perfil")}
          onNearbyPress={handleNearbyPress}
          loading={locationLoading}
        />

        <SearchBar
          placeholder="Buscar servicios..."
          value={searchText}
          onChangeText={setSearchText}
          onSearchPress={() => fetchServices(1, searchText)}
        />
        <BannerBoost/>

        <View className="pb-6">
          {/* Lista de servicios */}
          {services.map((service) => (
            <ServiceFeedCard
              key={service.id}
              id={service.id}
              title={service.title}
              address={service.address}
              category={service.category}
              personName={service.personName}
              serviceImages={service.serviceImages}
              description={service.description}
              isFavorite={service.isFavorite}
              onToggleFavorite={() =>
                handleToggleFavorite(service.id, service.isFavorite)
              }
              onPress={() => router.push(`/servicio/${service.id}`)}
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

function isCloseToBottom({
  layoutMeasurement,
  contentOffset,
  contentSize,
}: any) {
  const paddingToBottom = 20;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
}
