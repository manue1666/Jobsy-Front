import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useColorScheme } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { FormCard } from "@/components/authComponents/FormCard";
import { Stack, useLocalSearchParams } from "expo-router";
import { AppLogo } from "@/components/authComponents/AppLogo";
import { ThemeContext } from "@/context/themeContext";
import { MaterialIcons } from "@expo/vector-icons";

export default function ReportScreen() {
  const { currentTheme } = React.useContext(ThemeContext);
  const isDark = currentTheme === "dark";
  const params = useLocalSearchParams();
  const serviceId = params.serviceId || params.id;
  const userId = params.userId;
  const serviceName = params.serviceName;

  const handleReportPress = () => {
    const subject = encodeURIComponent("Reporte de publicación Jobsy");
    const body = encodeURIComponent(
      `Hola, quiero reportar la publicación con ID: ${serviceId}\nNombre del servicio: ${serviceName}\nID del usuario: ${userId}\nMotivo del reporte: `
    );
    const mailto = `mailto:reportesjobsy@gmail.com?subject=${subject}&body=${body}`;
    Linking.openURL(mailto);
  };

  return (
    <ScreenContainer androidSafeArea={false}>
      <Stack.Screen
        options={{
          title: "Reporte de Servicio",
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#000000",
        }}
      />
      <ScrollView className="flex-1 px-6">
        <FormCard title="Reporte de Servicio" scrollable={false}>
          <View className="mb-8">
            <AppLogo variant="colored" size="medium" />
          </View>
          <Text
            className={`${isDark ? "text-gray-300" : "text-gray-700"} text-base mb-4`}
          >
            Al Reportar un servicio, estás ayudando a mantener la calidad y
            confiabilidad de nuestra plataforma. Tu reporte será revisado por
            nuestro equipo y tomaremos las medidas necesarias para abordar la
            situación.
            {"\n"}
            Presiona el botón de Reportar si consideras que este servicio
            infringe nuestras políticas o si has tenido una experiencia negativa
            con el proveedor del servicio.
            {"\n"}
            Al reportar se te redirigirá al correo de reportes de Jobsy donde se
            pasará la información del usuario a reportar y el motivo del
            reporte.
            {"\n"}
            Gracias por contribuir a una comunidad segura y confiable en Jobsy.
          </Text>
          <TouchableOpacity
            onPress={handleReportPress}
            className="bg-yellow-400 py-3 px-6 rounded-full flex-row items-center justify-center mt-4 shadow"
            activeOpacity={0.85}
          >
            <MaterialIcons name="report" size={20} color="#B45309" />
            <Text className="ml-2 text-base font-semibold text-yellow-900">
              Reportar publicación
            </Text>
          </TouchableOpacity>
        </FormCard>
      </ScrollView>
    </ScreenContainer>
  );
}
