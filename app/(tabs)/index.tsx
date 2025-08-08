import React, { useState, useEffect } from 'react';
import { ScrollView, View, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SearchBar } from '@/components/mainComponents/favoritos/searchBar';
import { FeedHeader } from '@/components/mainComponents/principal/header';
import { ServiceFeedCard } from '@/components/mainComponents/principal/ServiceFeedCard';
import { searchService } from '@/helpers/search_service';
import { addFavorite, removeFavorite } from '@/helpers/favorites';
import { useRouter } from 'expo-router';

interface ServicePost {
  id: string;
  title: string;
  distance: string;
  personName: string;
  serviceImages: string[];
  description: string;
  isFavorite: boolean;
  category: string;
}

export default function MainFeedScreen() {
  const [searchText, setSearchText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [services, setServices] = useState<ServicePost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  // Función para transformar los datos del API
  const transformServiceData = (apiServices: any[]): ServicePost[] => {
    return apiServices.map(service => ({
      id: service._id,
      title: service.service_name,
      distance: calculateDistance(service.service_location.coordinates), // Función ficticia
      personName: service.user?.name || 'Anónimo',
      serviceImages: service.photos.length > 0 ? service.photos : [
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop' // Imagen por defecto
      ],
      description: service.description,
      isFavorite: service.isFavorite || false,
      category: service.category,
    }));
  };

  // Función de ejemplo para calcular distancia (simulada)
  const calculateDistance = (coordinates: number[]): string => {
    // Aquí deberías implementar el cálculo real basado en la ubicación del usuario
    const distance = Math.floor(Math.random() * 10) + 1; // Ejemplo aleatorio
    return `${distance}km`;
  };

  const fetchServices = async (pageNum = 1, searchQuery = '') => {
    try {
      setLoading(true);
      const result = await searchService({ 
        query: searchQuery,
        page: pageNum,
        limit: 10 // Puedes ajustar este valor
      });
      
      setServices(prev => pageNum === 1 
        ? transformServiceData(result.services) 
        : [...prev, ...transformServiceData(result.services)]);
      setTotalPages(result.pages);
      setPage(pageNum);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al cargar servicios');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSearch = () => {
    fetchServices(1, searchText);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchServices(1, searchText);
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      if (!isFavorite) {
        await addFavorite(id); // Lo agrego si no es favorito
      } else {
        await removeFavorite(id); // Lo quito si ya lo era
      }

      // Actualizar el estado localmente
      setServices(prev =>
        prev.map(service =>
          service.id === id ? { ...service, isFavorite: !isFavorite } : service
        )
      );
    } catch (error) {
      console.error('Error al marcar como favorito:', error);
      Alert.alert('Error', 'No se pudo actualizar el favorito');
    }
  };

  const handleServicePress = (serviceId: string) => {
    console.log('View service details:', serviceId);
    router.push(`/servicio/${serviceId}`)
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      fetchServices(page + 1, searchText);
    }
  };

  // Efecto inicial para cargar datos
  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
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
            onRefresh={handleRefresh}
          />
        }
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Header */}
        <FeedHeader
          userName="Gabriel"
          onProfilePress={() => console.log('Profile pressed')}
          onNotificationsPress={() => console.log('Notifications pressed')}
        />

        {/* Search Bar */}
        <SearchBar
          placeholder="Buscar servicios..."
          value={searchText}
          onChangeText={setSearchText}
          onSearchPress={handleSearch}
        />

        {/* Service Feed */}
        <View className="pb-6">
          {/* Ejemplo de anuncio estático (similar al que tenías) */}
          <ServiceFeedCard
            id="ad-1"
            title="GRANDES PROPUESTAS"
            distance="Patrocinado"
            personName="Burger King"
            serviceImages={[
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
              'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop'
            ]}
            description="COMBO DELUXE CHEDDAR por solo $22. Las mejores hamburguesas al mejor precio. ¡Ordena ahora!"
            isFavorite={false}
            isAd={true}
            onPress={() => console.log('Anuncio presionado')}
          />

          {/* Lista de servicios */}
          {services.map((service) => (
            <ServiceFeedCard
              key={service.id}
              id={service.id}
              title={service.title}
              distance={service.distance}
              personName={service.personName}
              serviceImages={service.serviceImages}
              description={service.description}
              isFavorite={service.isFavorite}
              onToggleFavorite={() => handleToggleFavorite(service.id, service.isFavorite)}
              onPress={() => handleServicePress(service.id)}
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
const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: any) => {
  const paddingToBottom = 20;
  return layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom;
};