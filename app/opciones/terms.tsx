import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { FormCard } from "@/components/authComponents/FormCard";
import { Stack } from "expo-router";
import { AppLogo } from "@/components/authComponents/AppLogo";

export default function TermsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <ScreenContainer androidSafeArea={false}>
      <Stack.Screen
        options={{
          title: "Términos y condiciones",
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#000000",
        }}
      />
      <View className="flex-1 justify-center px-6">
        <FormCard title="Términos y condiciones" scrollable={false}>
          <View className="mb-8">
            <AppLogo variant="colored" size="medium" />
          </View>
          <Text
            className={`${isDark ? "text-gray-300" : "text-gray-700"} text-base mb-4`}
          >
            Estos son los términos y condiciones de uso de Jobsy. Al utilizar la aplicación, aceptas cumplir con las reglas y políticas establecidas. El uso de los servicios ofrecidos está sujeto a cambios y actualizaciones. Por favor, revisa esta sección periódicamente para estar informado sobre cualquier modificación.
            {"\n"}
            {"\n"}
            Si tienes dudas o inquietudes sobre nuestros términos, puedes contactarnos a través de los canales oficiales disponibles en la aplicación.
          </Text>
        </FormCard>
      </View>
    </ScreenContainer>
  );
}
