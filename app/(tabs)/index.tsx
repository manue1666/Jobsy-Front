import React, { useState } from "react";
import {
  ScrollView,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SearchBar } from '@/components/mainComponents/favoritos/searchBar';
import { FeedHeader } from '@/components/mainComponents/principal/header';
import { FilterPanel } from '@/components/mainComponents/principal/FilterPanel';
import { useRouter } from 'expo-router';
import { BannerBoost } from "@/components/mainComponents/principal/bannerBoost";
import { useServices } from "@/hooks/useServices";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ServiceList } from "@/components/mainComponents/principal/ServiceList";
import { isCloseToBottom } from "@/helpers/scrollUtils";

export default function MainFeedScreen() {
  const [filterPanelVisible, setFilterPanelVisible] = useState(false);
  
  const {
    searchText,
    setSearchText,
    isRefreshing,
    setIsRefreshing,
    services,
    loading,
    page,
    filters,
    fetchServices,
    handleToggleFavorite,
    handleApplyFilters,
    handleLoadMore,
    getActiveFiltersCount,
  } = useServices();
  
  const { profileData, loadProfileData } = useUserProfile();
  const router = useRouter();

  const getSafeUserData = React.useCallback(
    () => ({
      name: profileData?.user?.name || "Usuario",
      profilePhoto:
        profileData?.user?.profilePhoto || "https://via.placeholder.com/150",
    }),
    [profileData]
  );

  React.useEffect(() => {
    loadProfileData();
    fetchServices();
    // eslint-disable-next-line
  }, []);

  // Manejar búsqueda solo cuando se presiona el botón
  const handleSearch = () => {
    handleApplyFilters({ ...filters, searchText });
  };

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
      <FeedHeader
        userData={getSafeUserData()}
        onProfilePress={() => router.push("/perfil")}
        onFilterPress={() => setFilterPanelVisible(true)}
        activeFiltersCount={getActiveFiltersCount()}
      />
      
      <SearchBar
        placeholder="Buscar servicios..."
        value={searchText}
        onChangeText={setSearchText} // Solo actualiza el estado local
        onSearchPress={handleSearch} // Busca solo al presionar
      />

      <FilterPanel
        visible={filterPanelVisible}
        onClose={() => setFilterPanelVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              fetchServices(1);
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
        <BannerBoost />
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
