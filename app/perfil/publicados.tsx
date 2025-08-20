import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ScrollView, View, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ServiceFeedCard } from '@/components/mainComponents/principal/ServiceFeedCard';
import { getUserServices, deleteService } from '@/helpers/service';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { OwnedServiceCard } from '@/components/mainComponents/principal/OwnedService';
import { ThemeContext } from '@/context/themeContext';

interface myService {
  id: string;
  title: string;
  personName: string;
  profilePic: string;
}

export default function MainFeedScreen() {
  const [searchText, setSearchText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [services, setServices] = useState<myService[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === 'dark';

  // Función para transformar los datos del API
  const transformServiceData = (apiServices: any[]): myService[] => {
    return apiServices.map(service => ({
      id: service._id,
      title: service.service_name,
      personName: service.user_id?.name || 'Anónimo',
      profilePic: service.user_id?.profilePhoto
    }));
  };

  const fetchServices = async (pageNum = 1, searchQuery = '', OwnerId = '') => {
    try {
      setLoading(true);
      const result = await getUserServices();

      setServices(prev => pageNum === 1
        ? transformServiceData(result.services)
        : [...prev, ...transformServiceData(result.services)]);
      setTotalPages(result.pages);
      setPage(pageNum);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al cargar servicios', [
        {
          text: 'OK'
        }
      ], {
        cancelable: true
      });
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
    console.log('Edit service:', serviceId);
    router.push(`/servicio/${serviceId}/editar`)
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
                setServices(prev => prev.filter(s => s.id !== serviceId));
                Alert.alert("Éxito", "El servicio ha sido eliminado.");
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "No se pudo eliminar el servicio");
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        fetchServices(1, '');
      }
      init();
    }, [])
  );

  return (
    <ScreenContainer>
      <Stack.Screen
        name="MyServices"
        options={{
          title: 'Mis servicios',
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" }, // Cambia el fondo del header
          headerTintColor: isDark ? "#ffffff" : "#000000", // Cambia el color del texto y flecha
        }}
      />
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

        {/* Service Feed */}
        <View className="pb-6">
          {/* Ejemplo de anuncio estático (similar al que tenías) */}
          <ServiceFeedCard
            id="ad-1"
            title="GRANDES PROPUESTAS"
            address="Patrocinado"
            category="Publicidad"
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
            <OwnedServiceCard
              key={service.id}
              id={service.id}
              profilePic={service.profilePic}
              title={service.title}
              personName={service.personName}
              onPress={() => handleServicePress(service.id)}
              onLongPress={() => handleLongPress(service.id)}
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