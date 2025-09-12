import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { FormCard } from "@/components/authComponents/FormCard";
import { Stack } from "expo-router";
import { AppLogo } from "@/components/authComponents/AppLogo";

export default function InfoScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <ScreenContainer androidSafeArea={false}>
      <Stack.Screen
        options={{
          title: "Información de la aplicación",
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#000000", // Color del botón back
        }}
      />
      <View className="flex-1 justify-center px-6">
        <FormCard title="Información de la aplicación" scrollable={false}>
          <View className="mb-8">
            <AppLogo variant="colored" size="medium" />
          </View>
          <Text
            className={`${isDark ? "text-gray-300" : "text-gray-700"} text-base mb-4`}
          >
            Jobsy es una aplicación móvil creada para conectar personas que
            necesitan ayuda con servicios técnicos o profesionales, y quienes
            pueden ofrecerlos. Si buscas un plomero de confianza, un electricista
            disponible hoy mismo, o alguien que te ayude con reparaciones
            generales, Jobsy te ayuda a encontrar al experto ideal de forma
            rápida y sencilla.
            {"\n"}
            {"\n"}
            Con Jobsy puedes:
            {"\n"}- Buscar y encontrar servicios cerca de ti.
            {"\n"}- Contactar y contratar profesionales de manera segura.
            {"\n"}- Guardar tus servicios favoritos para acceder a ellos
            fácilmente.
            {"\n"}- Publicar tus propios servicios si eres profesional y recibir
            solicitudes de clientes.
            {"\n"}
            {"\n"}
            La versión actual de Jobsy está en fase beta, por lo que seguimos
            mejorando y agregando nuevas funciones. ¡Explora, conecta y resuelve
            tus necesidades con Jobsy!
          </Text>
        </FormCard>
      </View>
    </ScreenContainer>
  );
}
