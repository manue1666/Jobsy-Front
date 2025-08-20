import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ThemeContext } from "@/context/themeContext";
import { boostService } from "@/helpers/boost_service";
import { useSafeStripe } from '@/hooks/useSafeStripe';

function ConfirmBoostScreen() {
  const params = useLocalSearchParams<{ serviceId?: string; planId?: string }>();
  const { currentTheme } = useContext(ThemeContext);
  const { initPaymentSheet, presentPaymentSheet, isAvailable, isLoading: stripeLoading } = useSafeStripe();
  const isDark = currentTheme === "dark";

  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const planPrices = { '24h': 1.50, '72h': 3.50, '1week': 6.00 };
  const currentPrice = planPrices[params.planId as keyof typeof planPrices] || 0;

  const handlePayment = async () => {
    if (!params.serviceId || !params.planId) {
      Alert.alert("Error", "Falta información del servicio o plan");
      return;
    }

    if (!isAvailable) {
      Alert.alert("Error", "Sistema de pagos no disponible en este momento");
      return;
    }

    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      const { clientSecret } = await boostService(params.serviceId, params.planId);

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Jobsy Marketplace",
        returnURL: "jobsy://stripe-redirect",
        style: isDark ? "alwaysDark" : "alwaysLight",
        allowsDelayedPaymentMethods: false,
      });

      if (error) throw new Error(`Error al configurar pago: ${error.message}`);

      const { error: paymentError } = await presentPaymentSheet();
      if (paymentError) throw new Error(`Error en el pago: ${paymentError.message}`);

      setPaymentStatus('success');
      Alert.alert("¡Éxito!", `Tu servicio ha sido boosteado con el plan ${params.planId}`,
        [{ text: "Aceptar", onPress: () => router.back() }]
      );

    } catch (error: any) {
      setPaymentStatus('error');
      Alert.alert("Error en el pago", error.message || "Ocurrió un error al procesar el pago");
    } finally {
      setIsLoading(false);
    }
  };

  if (stripeLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator size="large" />
        <Text className="text-center mt-4">Cargando sistema de pagos...</Text>
      </ScreenContainer>
    );
  }

  if (!isAvailable) {
    return (
      <ScreenContainer>
        <View className="p-6">
          <Text className="text-lg text-center text-red-600 mb-4">
            ⚠️ Sistema de pagos temporalmente no disponible
          </Text>
          <Text className="text-center text-gray-600">
            Estamos teniendo problemas técnicos con nuestro procesador de pagos.
            Por favor intenta más tarde.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          title: "Confirmar Boost",
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#000000",
        }}
      />

      <View className={`flex-1 px-6 py-8 ${isDark ? "bg-[#111823]" : "bg-white"}`}>
        <Text className={`text-2xl font-bold mb-6 text-center ${isDark ? "text-blue-100" : "text-blue-800"}`}>
          Confirmar Boost
        </Text>

        {/* Información del servicio */}
        <View className={`p-4 rounded-lg mb-6 ${isDark ? "bg-blue-900" : "bg-blue-50"}`}>
          <Text className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-blue-800"}`}>
            Resumen del Boost
          </Text>
          <Text className={`mb-1 ${isDark ? "text-blue-200" : "text-gray-700"}`}>
            ⚡ Plan: {params.planId}
          </Text>
          <Text className={`mb-1 ${isDark ? "text-blue-200" : "text-gray-700"}`}>
            💰 Precio: ${currentPrice.toFixed(2)} USD
          </Text>
          <Text className={`text-sm mt-2 ${isDark ? "text-blue-300" : "text-gray-500"}`}>
            El servicio aparecerá destacado en los resultados de búsqueda
          </Text>
        </View>

        {/* Botón de pago */}
        <TouchableOpacity
          onPress={handlePayment}
          disabled={isLoading}
          className={`py-4 px-6 rounded-lg mb-4 ${
            isLoading ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              💳 Pagar ${currentPrice.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>

        {/* Estado del pago */}
        {paymentStatus === 'success' && (
          <Text className="text-green-600 text-center mb-4">
            ✅ Pago completado exitosamente
          </Text>
        )}

        {paymentStatus === 'error' && (
          <Text className="text-red-600 text-center mb-4">
            ❌ Error en el pago
          </Text>
        )}

        {/* Información de seguridad */}
        <View className={`p-3 rounded-lg mt-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
          <Text className={`text-xs text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            🔒 Pagos seguros procesados por Stripe. Tus datos de pago están protegidos.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

export default ConfirmBoostScreen;

