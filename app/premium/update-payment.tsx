import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Stack } from "expo-router";
import { ThemeContext } from "@/context/themeContext";
import { createPremiumSetupIntentService } from "@/helpers/premium_user";
import { useSafeStripe } from "@/hooks/useSafeStripe";
import Colors from "@/constants/Colors";

export default function UpdatePaymentScreen() {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";
  const accent = Colors[currentTheme as keyof typeof Colors].tint;
  const textColor = isDark ? "text-white" : "text-black";
  const cardBg = isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100";

  const [isLoading, setIsLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const { initPaymentSheet, presentPaymentSheet, isAvailable, isLoading: stripeLoading } = useSafeStripe();

  const handleUpdatePayment = async () => {
    setIsLoading(true);
    setInfoMessage("");
    setSuccess(false);
    try {
      // 1. Solicitar SetupIntent
      setInfoMessage("Solicitando autorización para agregar nueva tarjeta...");
      const setupIntentRes = await createPremiumSetupIntentService();
      // 2. Inicializar PaymentSheet
      setInfoMessage("Abriendo formulario de Stripe para agregar nueva tarjeta...");
      const { error: setupError } = await initPaymentSheet({
        setupIntentClientSecret: setupIntentRes.setupIntentClientSecret,
        merchantDisplayName: "Jobsy Marketplace",
        returnURL: "jobsy://stripe-redirect",
        style: isDark ? "alwaysDark" : "alwaysLight",
      });
      if (setupError) throw new Error(setupError.message);
      // 3. Presentar PaymentSheet
      const result = await presentPaymentSheet();
      if (result.error) throw new Error(result.error.message);
      // 4. Mostrar éxito
      setSuccess(true);
      setInfoMessage("¡Método de pago actualizado correctamente! Los próximos cobros se harán a la nueva tarjeta.");
    } catch (error: any) {
      setInfoMessage("");
      Alert.alert("Error", error.message || "No se pudo actualizar el método de pago");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer androidSafeArea={false}>
      <Stack.Screen
        options={{
          title: "Actualizar método de pago",
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#000000",
        }}
      />
      <View className={`flex-1 px-6 py-8 justify-center items-center`}>
        <View className={`rounded-2xl p-6 mb-6 shadow-sm w-full ${cardBg}`}>
          <Text className={`text-2xl font-bold mb-4 text-center ${isDark ? 'text-green-400' : 'text-green-700'}`}>Actualizar método de pago</Text>
          <Text className={`mb-4 text-base text-center ${textColor}`}>Agrega una nueva tarjeta o método de pago para tu suscripción premium.</Text>
          {infoMessage && (
            <View className="bg-green-100 border border-green-300 p-3 rounded-lg mb-4">
              <Text className="text-green-800 text-center text-sm">{infoMessage}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={handleUpdatePayment}
            disabled={isLoading || stripeLoading || success}
            className={`py-4 px-6 rounded-lg mb-2 ${isLoading || stripeLoading || success ? "bg-green-300" : "bg-green-600"}`}
            activeOpacity={0.85}
          >
            {isLoading || stripeLoading ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator color="#fff" />
                <Text className="text-white ml-2 font-bold text-lg">Procesando...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-bold text-lg">Cambiar tarjeta</Text>
            )}
          </TouchableOpacity>
          {success && (
            <View className="bg-green-200 p-3 rounded-lg mt-2">
              <Text className="text-green-800 text-center font-semibold">¡Método de pago actualizado correctamente!</Text>
            </View>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
