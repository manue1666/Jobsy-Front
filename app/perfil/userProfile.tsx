// filepath: /home/waffles/proyectos/Jobsy-Front/app/perfil/userProfile.tsx
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { viewUserProfile } from "@/helpers/profile";
import { ThemeContext } from "@/context/themeContext";

interface UserData {
  _id: string;
  name: string;
  email?: string;
  profilePhoto?: string;
  createdAt?: string;
  isPremium?: boolean;
  servicesCount?: number;
}

interface ServiceData {
  _id: string;
  service_name: string;
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [user, setUser] = useState<UserData | null>(null);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";
  const textColor = isDark ? "text-white" : "text-black";
  const subtitleColor = isDark ? "text-gray-400" : "text-gray-500";
  const cardBg = isDark
    ? "bg-gray-800 border border-gray-700"
    : "bg-white border border-gray-100";
  const serviceCardBg = isDark ? "bg-gray-800" : "bg-gray-100";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!userId) return;
        const data = await viewUserProfile(userId as string);
        setUser(data.user);
        setServices(data.services || []);
      } catch (e: any) {
        setError(e.message || "Error al cargar el usuario");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <ScreenContainer>
        <View
          className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-white"}`}
        >
          <ActivityIndicator size="large" color={isDark ? "white" : "black"} />
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View
          className={`flex-1 justify-center items-center p-4 ${isDark ? "bg-gray-900" : "bg-white"}`}
        >
          <Text className="text-red-500">{error}</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!user) {
    return (
      <ScreenContainer>
        <View
          className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-white"}`}
        >
          <Text className={textColor}>Usuario no encontrado</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          title: "Información del usuario",
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#000000",
        }}
      />
      <ScrollView
        className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mt-8 px-6">
          <Image
            source={{
              uri: user.profilePhoto || "https://via.placeholder.com/150",
            }}
            className="w-32 h-32 rounded-full mb-4"
          />
          <Text className={`text-3xl font-bold mb-1 ${textColor}`}>
            {user.name}
          </Text>
          {user.email && (
            <Text className={`text-center mb-2 text-lg ${subtitleColor}`}>
              {user.email}
            </Text>
          )}
          {user.isPremium && (
            <View className="flex-row items-center justify-center mb-2">
              <View className="flex-row items-center px-4 py-1 rounded-full bg-yellow-100 border border-yellow-300">
                <Text className="text-base font-bold text-yellow-800">
                  Usuario Premium
                </Text>
              </View>
            </View>
          )}
          {user.createdAt && (
            <Text className="text-gray-500 text-base mb-2">
              Miembro desde {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          )}
          <Text className={`text-xl font-semibold mt-4 mb-2 ${textColor}`}>
            Servicios publicados: {user.servicesCount || services.length}
          </Text>
        </View>
        <View className={`mt-6 mx-4 px-6 py-6 rounded-2xl shadow-lg ${cardBg}`}>
          <Text className={`text-2xl font-bold mb-4 ${textColor}`}>Servicios</Text>
          {services.length === 0 ? (
            <Text className={`text-lg ${subtitleColor}`}>
              Este usuario no tiene servicios publicados.
            </Text>
          ) : (
            <View>
              {services.map((service) => (
                <TouchableOpacity
                  key={service._id}
                  className={`mb-4 rounded-xl shadow-lg ${isDark ? 'bg-gray-900' : 'bg-white'} border border-gray-200`}
                  style={{ elevation: 4 }}
                  onPress={() =>
                    router.push({
                      pathname: "/servicio/[id]/details",
                      params: {
                        id: service._id,
                        personName: user.name,
                        profilePhoto: user.profilePhoto,
                      },
                    })
                  }
                >
                  <View className="p-5">
                    <Text className={`text-xl font-bold ${textColor}`}>{service.service_name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View className="h-10" />
      </ScrollView>
    </ScreenContainer>
  );
}
