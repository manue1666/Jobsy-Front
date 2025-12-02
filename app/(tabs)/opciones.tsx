import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ThemeContext } from "@/context/themeContext";

export default function ProfileScreen() {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";
  const textColor = isDark ? "text-white" : "text-black";
  const subtitleColor = isDark ? "text-gray-400" : "text-gray-500";
  const cardBg = isDark
    ? "bg-gray-800 border border-gray-700"
    : "bg-white border border-gray-100";
  
  interface AppData {
    version: string;
  }
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  //Llamada a la API simulada para carga de datos
  useEffect(() => {
    setTimeout(() => {
      setAppData({
        version: "1.0.0",
      });
      setLoading(false);
    }, 1000);
  }, []);

  const options = [
    {
      icon: (color: string) => <Feather name="moon" size={24} color={color} />,
      title: "Modo oscuro",
      subtitle: "Cambia entre modos de vista",
      onPress: () => router.push("/opciones/tema"),
    },
    {
      icon: (color: string) => (
        <Feather name="credit-card" size={24} color={color} />
      ),
      title: "Gestionar suscripción Premium",
      subtitle: "Ver y administrar tu suscripción premium",
      onPress: () => router.push("/premium/suscriptions"),
    },
    {
      icon: (color: string) => <Feather name="list" size={24} color={color} />,
      title: "Informacion de la app",
      subtitle: "Revisa la informacion de Jobsy",
      onPress: () => router.push("/opciones/info"),
    },
    {
      icon: (color: string) => <Feather name="alert-circle" size={24} color={color} />,
      title: "Reportar problema",
      subtitle: "Informa cualquier problema de la app",
      onPress: () => router.push("/opciones/reportJobsy"),
    },
    {
      icon: () => (
        <Image
          source={{
            uri: "https://teteocan.com/wp-content/uploads/2025/06/fav.png",
          }}
          style={{
            width: 32,
            height: 26,
            borderRadius: 2,
            resizeMode: "cover",
          }}
        />
      ),
      title: "Proyectos Teteocan",
      subtitle: "Explora las oportunidades Teteocan que te brindaron esta app",
      onPress: () => Linking.openURL("https://teteocan.com/servicios/"),
    },
  ];

  return (
    <ScreenContainer>
      <SafeAreaView className="flex-1 items-center px-6 py-4 justify-between">
        {loading ? (
          <ActivityIndicator size="large" color={isDark ? "white" : "black"} />
        ) : (
          <>
            <View className="w-full items-center">
              {/* Título */}
              <Text className={`text-3xl font-semibold mb-4 ${textColor}`}>
                Configuracion
              </Text>

              {/* Opciones */}
              <View className="w-full space-y-3 mt-4">
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={option.onPress}
                    activeOpacity={0.7}
                    className={`flex-row items-start p-4 mt-1 rounded-3xl shadow-sm ${cardBg}`}
                  >
                    <View className="mr-3">
                      {option.icon(isDark ? "white" : "black")}
                    </View>
                    <View className="flex-1">
                      <Text className={`font-semibold ${textColor}`}>
                        {option.title}
                      </Text>
                      <Text
                        className={`text-sm ${subtitleColor}`}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {option.subtitle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="w-full space-y-3">
              <Text className={`font-semibold ${textColor} text-center`}>
                v {appData?.version}
              </Text>
            </View>
          </>
        )}
      </SafeAreaView>
    </ScreenContainer>
  );
}
