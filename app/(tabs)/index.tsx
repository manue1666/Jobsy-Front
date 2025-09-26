import React from "react";
import {
  ScrollView,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SearchBar } from '@/components/mainComponents/favoritos/searchBar';
import { FeedHeader } from '@/components/mainComponents/principal/header';
import { useRouter } from 'expo-router';
import { BannerBoost } from "@/components/mainComponents/principal/bannerBoost";
import { useServices } from "@/hooks/useServices"; // Movido fuera de (tabs)
import { useUserProfile } from "@/hooks/useUserProfile"; // Movido fuera de (tabs)
import { ServiceList } from "@/components/mainComponents/principal/ServiceList"; // Movido fuera de (tabs)
import { isCloseToBottom } from "@/helpers/scrollUtils"; // Movido fuera de (tabs)

export const BOOST_PLANS = {
  "24h": { amount: 150, durationMs: 24 * 60 * 60 * 1000 },
  "72h": { amount: 350, durationMs: 72 * 60 * 60 * 1000 },
  "1week": { amount: 600, durationMs: 7 * 24 * 60 * 60 * 1000 },
};

export default function MainFeedScreen() {
  // Hooks custom extraídos
  const {
    searchText,
    setSearchText,
    isRefreshing,
    setIsRefreshing,
    services,
    loading,
    page,
    fetchServices,
    handleToggleFavorite,
    handleNearbyPress,
    handleLoadMore,
    locationLoading,
  } = useServices();
  const { profileData, loadProfileData } = useUserProfile();
  const router = useRouter();

  // Helper para datos de usuario seguro
  const getSafeUserData = React.useCallback(
    () => ({
      name: profileData?.user?.name || "Usuario",
      profilePhoto:
        profileData?.user?.profilePhoto || "https://via.placeholder.com/150",
    }),
    [profileData]
  );

  // Actualizar automáticamente perfil y servicios
  React.useEffect(() => {
    loadProfileData();
    fetchServices();
    // eslint-disable-next-line
  }, []);

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

        {/* Lista de servicios modularizada */}
        <ServiceList
          services={services}
          loading={loading}
          page={page}
          onToggleFavorite={handleToggleFavorite}
          onPress={(service) =>
            router.push({
              pathname: "/servicio/[id]/details",
              params: {
                id: service.id,
                personName: service.personName,
                profilePhoto: service.profilePhoto,
              },
            })
          }
        />
      </ScrollView>
    </ScreenContainer>
  );
}

// isCloseToBottom ahora está en scrollUtils.ts
