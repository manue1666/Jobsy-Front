import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ScrollView, View, useColorScheme, Alert, RefreshControl, SafeAreaView } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SearchBar } from '@/components/mainComponents/favoritos/searchBar';
import { FavoriteCard } from '@/components/mainComponents/favoritos/favoritosCard';
import { removeFavorite } from '@/helpers/favorites';
import { searchService } from '@/helpers/search_service';
import { useFocusEffect, useRouter } from 'expo-router';
import { ThemeContext } from '@/context/themeContext';

interface FavoriteItem {
  id: string;
  title: string;
  distance: string;
  personName: string;
  profilePic: string;
  isFavorite: boolean;
}

export default function FavoritesScreen() {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === 'dark';
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter()

  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Función para transformar los datos del API
  const transformServiceData = (apiServices: any[]): FavoriteItem[] => {
    return apiServices.map(service => ({
      id: service._id,
      title: service.service_name,
      distance: calculateDistance(service.service_location.coordinates), // Función ficticia
      personName: service.user?.name || 'Anónimo',
      profilePic: service.user?.profilePhoto,
      isFavorite: service.isFavorite || false,
    }));
  };

  // Función de ejemplo para calcular distancia (simulada)
  const calculateDistance = (coordinates: number[]): string => {
    // Aquí deberías implementar el cálculo real basado en la ubicación del usuario
    const distance = Math.floor(Math.random() * 10) + 1; // Ejemplo aleatorio
    return `${distance}km`;
  };

  const fetchFavorites = async (pageNum = 1, searchQuery = '') => {
    try {
      setLoading(true);
      const result = await searchService({
        query: searchQuery,
        page: pageNum,
        limit: 10 // Puedes ajustar este valor
      });

      setFavorites(prev => pageNum === 1
        ? transformServiceData(result.services)
        : [...prev, ...transformServiceData(result.services)]);
      setTotalPages(result.pages);
      setPage(pageNum);
    } catch (error: any) {
      Alert.alert('Error',error.message || 'Error al cargar servicios',[
        {
          text : 'OK'
        }
        ], {
        cancelable : true
        });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      await removeFavorite(id); // remover favorito

      // Actualizar el estado localmente
      setFavorites(prev =>
        prev.map(service =>
          service.id === id ? { ...service, isFavorite: !isFavorite } : service
        )
      );
    } catch (error) {
      console.error('Error al marcar como favorito:', error);
      Alert.alert('Error','No se pudo actualizar el favorito',[
        {
          text : 'OK'
        }
        ], {
        cancelable : true
        });
    }
  };

  const handleSearch = () => {
    fetchFavorites(1, searchText);
  };

  const handleServicePress = (serviceId: string) => {
    console.log('View service details:', serviceId);
    router.push(`/servicio/${serviceId}`)
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFavorites(1, searchText);
  };

  const filteredFavorites = favorites.filter(item =>
    item.isFavorite &&
    (item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.personName.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      fetchFavorites(page + 1, searchText);
    }
  };

  // Efecto inicial para cargar datos y actualizacion automatica
  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  return (
    <ScreenContainer>
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
        <SearchBar
          placeholder="Buscar favoritos..."
          value={searchText}
          onChangeText={setSearchText}
          onSearchPress={handleSearch}
        />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
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
          {filteredFavorites.map((item) => (
            <FavoriteCard
              key={item.id}
              id={item.id}
              title={item.title}
              distance={item.distance}
              personName={item.personName}
              profilePic={item.profilePic}
              isFavorite={item.isFavorite}
              onToggleFavorite={handleToggleFavorite}
              onPress={() => handleServicePress(item.id)}
            />
          ))}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

// Función auxiliar para detectar scroll cerca del final
const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: any) => {
  const paddingToBottom = 20;
  return layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom;
};