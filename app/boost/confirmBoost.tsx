import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Linking } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ThemeContext } from "@/context/themeContext";
import { boostService } from "@/helpers/boost_service";
import { useSafeStripe } from '@/hooks/useSafeStripe';

function ConfirmBoostScreen() {
  const params = useLocalSearchParams<{ serviceId?: string; planId?: string; serviceName?: string }>();
  const { currentTheme } = useContext(ThemeContext);
  const { initPaymentSheet, presentPaymentSheet, isAvailable, isLoading: stripeLoading } = useSafeStripe();
  const isDark = currentTheme === "dark";

  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const planPrices = { '24h': 1.50, '72h': 3.50, '1week': 6.00 };
  const planDurations = { '24h': '24 horas', '72h': '72 horas', '1week': '1 semana' };
  const currentPrice = planPrices[params.planId as keyof typeof planPrices] || 0;
  const durationText = planDurations[params.planId as keyof typeof planDurations] || '';

  // Configurar el deep linking para el retorno de Stripe
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      if (event.url.includes('stripe-redirect')) {
        // Verificar el estado del pago después de regresar de Stripe
        checkPaymentStatus();
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    return () => {
      subscription.remove();
    };
  }, []);

  const initializePaymentSheet = async () => {
    if (!params.serviceId || !params.planId) {
      Alert.alert("Error", "Falta información del servicio o plan");
      return false;
    }

    try {
      const response = await boostService(params.serviceId, params.planId);
      setClientSecret(response.clientSecret);

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: response.clientSecret,
        merchantDisplayName: "Jobsy Marketplace",
        returnURL: "jobsy://stripe-redirect",
        style: isDark ? "alwaysDark" : "alwaysLight",
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: {
          name: "Cliente Jobsy",
        },
      });

      if (error) {
        console.error('Error initializing payment sheet:', error);
        throw new Error(`Error al configurar pago: ${error.message}`);
      }

      return true;
    } catch (error: any) {
      console.error('Error in payment initialization:', error);
      Alert.alert("Error", error.message || "Ocurrió un error al inicializar el pago");
      return false;
    }
  };

  const checkPaymentStatus = async () => {
    if (!clientSecret) return;
    
    try {
      // Aquí podrías implementar una verificación con tu backend
      // para confirmar que el pago fue procesado correctamente
      // y el servicio fue boosteado
      
      // Por ahora, asumimos éxito si llegamos aquí
      setPaymentStatus('success');
      Alert.alert(
        "¡Éxito!", 
        `Tu servicio ha sido boosteado con el plan ${params.planId} (${durationText})`,
        [{ text: "Aceptar", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentStatus('error');
      Alert.alert("Error", "No se pudo verificar el estado del pago. Contacta con soporte.");
    }
  };

  const handlePayment = async () => {
    if (!isAvailable) {
      Alert.alert("Error", "Sistema de pagos no disponible en este momento");
      return;
    }

    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      // Inicializar la hoja de pago
      const initialized = await initializePaymentSheet();
      if (!initialized) {
        setIsLoading(false);
        return;
      }

      // Presentar la hoja de pago
      const { error } = await presentPaymentSheet();
      
      if (error) {
        console.error('Payment sheet error:', error);
        
        // No es un error si el usuario simplemente cancela el pago
        if (error.code !== 'Canceled') {
          throw new Error(error.message || "Ocurrió un error al procesar el pago");
        } else {
          setPaymentStatus('idle');
          Alert.alert("Pago cancelado", "El proceso de pago fue cancelado.");
        }
      } else {
        // Éxito - el pago se completó
        setPaymentStatus('success');
        Alert.alert(
          "¡Éxito!", 
          `Tu servicio ha sido boosteado con el plan ${params.planId} (${durationText})`,
          [{ text: "Aceptar", onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      Alert.alert("Error en el pago", error.message || "Ocurrió un error al procesar el pago");
    } finally {
      setIsLoading(false);
    }
  };

  if (stripeLoading) {
    return (
      <ScreenContainer>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={isDark ? "#3b82f6" : "#2563eb"} />
          <Text className={`text-center mt-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Inicializando sistema de pagos...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!isAvailable) {
    return (
      <ScreenContainer>
        <View className="p-6 flex-1 justify-center">
          <Text className="text-lg text-center text-red-600 mb-4">
            ⚠️ Sistema de pagos temporalmente no disponible
          </Text>
          <Text className={`text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Estamos teniendo problemas técnicos con nuestro procesador de pagos.
            Por favor intenta más tarde.
          </Text>
          
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 py-3 px-6 bg-blue-600 rounded-lg"
          >
            <Text className="text-white text-center font-bold">Volver</Text>
          </TouchableOpacity>
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
          
          {params.serviceName && (
            <Text className={`mb-3 ${isDark ? "text-blue-200" : "text-gray-700"}`}>
              🛠️ Servicio: {params.serviceName}
            </Text>
          )}
          
          <Text className={`mb-2 ${isDark ? "text-blue-200" : "text-gray-700"}`}>
            ⚡ Plan: {params.planId} ({durationText})
          </Text>
          <Text className={`mb-4 text-xl font-bold ${isDark ? "text-blue-100" : "text-blue-800"}`}>
            💰 Precio: ${currentPrice.toFixed(2)} USD
          </Text>
          
          <Text className={`text-sm mt-2 ${isDark ? "text-blue-300" : "text-gray-500"}`}>
            Tu servicio aparecerá destacado en los resultados de búsqueda durante {durationText.toLowerCase()}, 
            aumentando significativamente su visibilidad y probabilidad de contratación.
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
            <View className="flex-row justify-center items-center">
              <ActivityIndicator color="#ffffff" />
              <Text className="text-white ml-2 font-bold text-lg">Procesando...</Text>
            </View>
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              💳 Pagar ${currentPrice.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>

        {/* Estado del pago */}
        {paymentStatus === 'success' && (
          <View className="bg-green-100 p-3 rounded-lg mb-4">
            <Text className="text-green-800 text-center">
              ✅ Pago completado exitosamente. Tu servicio está siendo boosteado.
            </Text>
          </View>
        )}

        {paymentStatus === 'error' && (
          <View className="bg-red-100 p-3 rounded-lg mb-4">
            <Text className="text-red-800 text-center">
              ❌ Error en el pago. Por favor intenta nuevamente.
            </Text>
          </View>
        )}

        {/* Información de seguridad */}
        <View className={`p-3 rounded-lg mt-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
          <Text className={`text-xs text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            🔒 Pagos seguros procesados por Stripe. Tus datos de pago están protegidos y nunca se almacenan en nuestros servidores.
          </Text>
        </View>

        {/* Botón de cancelar */}
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={isLoading}
          className="mt-4 py-3 px-6 border border-gray-300 rounded-lg"
        >
          <Text className={`text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

export default ConfirmBoostScreen;