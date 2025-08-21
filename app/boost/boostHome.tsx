import React, { useState, useEffect, useContext } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { getUserServices } from '@/helpers/service';
import { useRouter, Stack } from 'expo-router';
import { ThemeContext } from '@/context/themeContext';
import { Ionicons } from "@expo/vector-icons";
import { ServiceFeedCard } from '@/components/mainComponents/principal/ServiceFeedCard';
import { OwnedServiceCard } from '@/components/mainComponents/principal/OwnedService';
import { ServiceToBoost } from '@/components/mainComponents/principal/serviceBoost';


// Boost plans info
export const BOOST_PLANS = {
  "24h": { amount: 30, durationMs: 24 * 60 * 60 * 1000 },
  "72h": { amount: 70, durationMs: 72 * 60 * 60 * 1000 },
  "1week": { amount: 120, durationMs: 7 * 24 * 60 * 60 * 1000 },
};

interface myService {
  id: string;
  title: string;
  personName: string;
  profilePic: string;
}

export default function BoostHomeScreen() {
  const [services, setServices] = useState<myService[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === 'dark';

  // Fetch user's services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const result = await getUserServices();
        setServices(result.services.map((service: any) => ({
          id: service._id,
          title: service.service_name,
          personName: service.user_id?.name || 'Anónimo',
          profilePic: service.user_id?.profilePhoto
        })));
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Error al cargar servicios');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Handle service selection
  const handleSelectService = (serviceId: string) => {
    // Redirige a la pantalla de selección de plan, pasando el id del servicio
    router.push({ pathname: "/boost/selectBoost", params: { serviceId } });
  };

  return (
    <ScreenContainer>
      <Stack.Screen
        name="BoostHome"
        options={{
          title: 'Impulsa tu servicio',
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#000000",
        }}
      />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Boost Info Banner */}
        <View className={`mx-4 my-4 p-4 rounded-2xl ${isDark ? "bg-blue-900" : "bg-blue-100"} border border-blue-300`}>
          <View className="flex-row items-center mb-2">
            <Ionicons name="rocket-outline" size={28} color="#b2e9ffff" style={{ marginRight: 10 }} />
            <Text className={`font-bold text-lg ${isDark ? "text-white" : "text-blue-900"}`}>¿Qué es Boost?</Text>
          </View>
          <Text className={`mb-2 ${isDark ? "text-blue-100" : "text-blue-900"}`}>
            Destaca tu servicio para que más personas lo vean en la plataforma. Elige un plan y aumenta tu visibilidad.
          </Text>
          <View className="flex-row items-center mb-1">
            <Ionicons name="flash-outline" size={18} color="#fbbf24" style={{ marginRight: 4 }} />
            <Text className={`font-semibold ${isDark ? "text-yellow-200" : "text-yellow-700"}`}>Planes disponibles:</Text>
          </View>
          <View className="ml-6">
            <Text className={`${isDark ? "text-blue-100" : "text-blue-900"}`}>• 24h: <Text className="font-bold">$30</Text></Text>
            <Text className={`${isDark ? "text-blue-100" : "text-blue-900"}`}>• 72h: <Text className="font-bold">$70</Text></Text>
            <Text className={`${isDark ? "text-blue-100" : "text-blue-900"}`}>• 1 semana: <Text className="font-bold">$120</Text></Text>
          </View>
        </View>

        {/* Selecciona el servicio */}
        <View className="pb-6">
          {/* Lista de servicios */}
          {services.map((service) => (
            <ServiceToBoost
              key={service.id}
              id={service.id}
              profilePic={service.profilePic}
              title={service.title}
              personName={service.personName}
              onPress={() => handleSelectService(service.id)}
              onLongPress={() => {}}
            />
          ))}

          {loading && (
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